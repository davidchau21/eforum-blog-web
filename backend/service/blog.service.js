import mongoose from "mongoose";
import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import Notification from "../Schema/Notification.js";
import Comment from "../Schema/Comment.js";
import SavedBlog from "../Schema/SavedBlog.js";
import Collection from "../Schema/Collection.js";
import UserFollow from "../Schema/UserFollow.js";
import UserInterest from "../Schema/UserInterest.js";
import EE from "../socket/eventManager.js";
import GroupMember from "../Schema/GroupMember.js";
import Group from "../Schema/Group.js";

async function notifyGroupMembersOfNewPost(blog, authorId) {
  try {
    const groupMembers = await GroupMember.find({
      group: blog.group,
      status: "JOINED",
      user: { $ne: authorId },
      muteNotifications: { $ne: true }
    });

    for (const member of groupMembers) {
      EE.emit("publish-notification", {
        type: "group_new_post",
        user: authorId,
        notification_for: member.user,
        group: blog.group,
        blog: blog._id
      });
    }
  } catch (err) {
    console.error("Failed to send group new post notifications:", err.message);
  }
}

class BlogService {
  async getForbiddenGroupIds(userId) {
    const privateGroups = await Group.find({ isPrivate: true }).select("_id");
    const privateGroupIds = privateGroups.map(g => g._id.toString());
    
    if (!userId) {
      return privateGroupIds;
    }
    
    const joinedMemberships = await GroupMember.find({
      user: userId,
      group: { $in: privateGroupIds },
      status: "JOINED"
    }).select("group");
    
    const joinedGroupIds = new Set(joinedMemberships.map(m => m.group.toString()));
    
    return privateGroupIds.filter(id => !joinedGroupIds.has(id));
  }

  async attachGroupMemberships(blogs, userId) {
    if (!blogs || !blogs.length) return blogs;
    
    const groupIds = blogs
      .map(b => b.group?._id || b.group)
      .filter(Boolean);
      
    if (!groupIds.length) return blogs;
    
    let memberships = [];
    if (userId) {
      memberships = await GroupMember.find({
        user: userId,
        group: { $in: groupIds }
      });
    }
    
    const membershipMap = {};
    memberships.forEach(m => {
      membershipMap[m.group.toString()] = m;
    });
    
    return blogs.map(blog => {
      const blogObj = blog.toObject ? blog.toObject() : blog;
      if (blogObj.group) {
        if (typeof blogObj.group === 'object') {
          blogObj.group.myMembership = membershipMap[blogObj.group._id.toString()] || null;
        }
      }
      return blogObj;
    });
  }

  /**
   * Create or update a blog post
   */
  async createOrUpdateBlog({ authorId, title, des, banner, tags, content, draft, id, groupId }) {
    if (!title.length) {
      throw new Error("You must provide a title");
    }

    let isActiveVal = false;
    if (groupId) {
      const groupDoc = await Group.findById(groupId);
      if (!groupDoc) throw new Error("Nhóm không tồn tại.");
      
      const membership = await GroupMember.findOne({ group: groupId, user: authorId, status: "JOINED" });
      if (!membership) {
        throw new Error("Bạn không có quyền đăng bài trong nhóm này (chưa tham gia hoặc chưa được duyệt).");
      }

      const isGroupAdmin = membership.role === "OWNER" || membership.role === "DEPUTY" || membership.role === "MODERATOR";
      const approvalRequired = groupDoc.settings?.memberPostApprovalRequired;

      if (isGroupAdmin || !approvalRequired) {
        isActiveVal = true;
      } else {
        isActiveVal = false;
      }
    } else {
      isActiveVal = false;
    }

    if (!draft) {
      if (des && des.length > 200) {
        throw new Error("Blog description must be under 200 characters");
      }
      if (!groupId && (!banner || !banner.length)) {
        throw new Error("You must provide blog banner to publish it");
      }
      if (!content || !content.blocks || !content.blocks.length) {
        throw new Error("There must be some blog content to publish it");
      }
      if (tags && tags.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
    }

    const blog_id =
      id ||
      title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim() + nanoid();

    if (id) {
      const updateData = {
        title,
        des,
        banner,
        content,
        tags,
        draft: draft ? draft : false,
      };
      if (groupId !== undefined) {
        updateData.group = groupId || null;
      }

      const oldBlog = await Blog.findOne({ blog_id });
      const wasDraft = oldBlog ? oldBlog.draft : false;

      if (wasDraft && !draft) {
        updateData.isActive = isActiveVal;
      }

      await Blog.findOneAndUpdate(
        { blog_id },
        {
          $set: updateData,
        }
      );

      const newBlog = await Blog.findOne({ blog_id });
      if (newBlog && !newBlog.draft && wasDraft && newBlog.group && newBlog.isActive) {
        await notifyGroupMembersOfNewPost(newBlog, authorId);
      }

      return { id: blog_id, message: "Blog updated successfully", isActive: newBlog ? newBlog.isActive : isActiveVal };
    } else {
      const author = await User.findById(authorId);
      if (!author) throw new Error("Author not found");

      const blog = new Blog({
        title,
        des,
        banner,
        content,
        tags,
        author: author._id,
        blog_id,
        draft: Boolean(draft),
        isActive: draft ? false : isActiveVal,
        isDeleted: false,
        group: groupId || null,
      });

      const savedBlog = await blog.save();
      let incrementVal = draft ? 0 : 1;

      await User.findOneAndUpdate(
        { _id: authorId },
        { $inc: { "account_info.total_posts": incrementVal } }
      );

      if (!savedBlog.draft && savedBlog.group && savedBlog.isActive) {
        await notifyGroupMembersOfNewPost(savedBlog, authorId);
      }

      return { id: savedBlog.blog_id, isActive: savedBlog.isActive };
    }
  }

  /**
   * Get a single blog by ID or blog_id
   */
  async getBlog({ blog_id, draft, mode, userId = null }) {
    let incrementVal = mode !== "edit" ? 1 : 0;

    const blog = await Blog.findOneAndUpdate(
      { blog_id },
      { $inc: { "activity.total_reads": incrementVal } },
      { new: true }
    )
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img personal_info.role"
      )
      .populate("group", "name avatar banner isPrivate")
      .select("title des content banner activity publishedAt blog_id tags isReport isActive draft group");

    if (!blog) {
      throw new Error("Blog not found");
    }

    if (blog.group && blog.group.isPrivate) {
      if (!userId) {
        throw new Error("Bài viết thuộc nhóm riêng tư. Vui lòng đăng nhập và tham gia nhóm để xem.");
      }
      const membership = await GroupMember.findOne({
        group: blog.group._id,
        user: userId,
        status: "JOINED"
      });
      if (!membership) {
        throw new Error("Bài viết thuộc nhóm riêng tư. Bạn cần tham gia nhóm để xem.");
      }
    }

    if (incrementVal > 0 && blog.author) {
      await User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        { $inc: { "account_info.total_reads": incrementVal } }
      ).catch((err) => console.error("Failed to update user total reads", err.message));
    }

    if (blog.draft && !draft) {
      throw new Error("You cannot access draft blogs");
    }

    return { blog };
  }

  /**
   * Delete a blog post
   */
  async deleteBlog(blog_id, userId) {
    const blog = await Blog.findOneAndDelete({ blog_id });
    if (!blog) {
      throw new Error("Blog not found");
    }

    // Delete associated notifications and comments
    await Notification.deleteMany({ blog: blog._id });
    await Comment.deleteMany({ blog_id: blog._id });
    await SavedBlog.deleteMany({ blog: blog._id });

    // Decrement post count
    await User.findOneAndUpdate(
      { _id: blog.author },
      { $inc: { "account_info.total_posts": -1 } }
    );

    return { status: "success" };
  }

  /**
   * Get latest blogs for feed
   */
  async getLatestBlogs({ page = 1, limit = 6, userInterests = [], followingIds = [], currentUserId = null }) {
    const forbiddenGroupIds = await this.getForbiddenGroupIds(currentUserId);
    const blogs = await Blog.find({
      draft: false,
      isActive: true,
      $or: [
        { group: null },
        { group: { $nin: forbiddenGroupIds } }
      ]
    })
      .populate({
        path: "author",
        match: { "personal_info.role": { $ne: "ADMIN" } },
        select: "personal_info.profile_img personal_info.username personal_info.fullname",
      })
      .populate("group", "name avatar banner isPrivate")
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt group")
      .skip((page - 1) * limit)
      .limit(limit);

    const populatedBlogs = await this.attachGroupMemberships(blogs, currentUserId);

    const filteredBlogs = populatedBlogs
      .filter((blog) => blog.author && blog.author.personal_info.role !== "ADMIN")
      .map((blog) => {
        const isFollowingAuthor = currentUserId && followingIds.includes(blog.author._id.toString());
        return { ...blog, isFollowingAuthor };
      });

    return { blogs: filteredBlogs };
  }

  async getFollowingBlogs(userId, page = 1) {
    let maxLimit = 5;
    const followDocs = await UserFollow.find({ follower: userId }).select("following -_id");
    const following = followDocs.map((item) => item.following);

    if (!following.length) return { blogs: [] };

    const forbiddenGroupIds = await this.getForbiddenGroupIds(userId);
    const blogs = await Blog.find({
      author: { $in: following },
      draft: false,
      isActive: true,
      $or: [
        { group: null },
        { group: { $nin: forbiddenGroupIds } }
      ]
    })
      .skip((page - 1) * maxLimit)
      .limit(maxLimit)
      .sort({ publishedAt: -1 })
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname")
      .populate("group", "name avatar banner isPrivate")
      .select("blog_id title des banner activity tags publishedAt group");

    const populatedBlogs = await this.attachGroupMemberships(blogs, userId);
    return { blogs: populatedBlogs };
  }

  async getFollowingBlogsCount(userId) {
    const followDocs = await UserFollow.find({ follower: userId }).select("following -_id");
    const following = followDocs.map((item) => item.following);
    if (!following.length) return 0;
    
    const forbiddenGroupIds = await this.getForbiddenGroupIds(userId);
    return await Blog.countDocuments({
      author: { $in: following },
      draft: false,
      isActive: true,
      $or: [
        { group: null },
        { group: { $nin: forbiddenGroupIds } }
      ]
    });
  }

  async getAdminBlogs() {
    const admins = await User.find({ "personal_info.role": "ADMIN" }).select("_id");
    const adminIds = admins.map((admin) => admin._id);

    const blogs = await Blog.find({
      author: { $in: adminIds },
      draft: false,
      isActive: true,
    })
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img personal_info.role"
      )
      .select("title des banner activity publishedAt blog_id tags")
      .sort({ publishedAt: -1 })
      .limit(10);

    return { blogs };
  }

  async getTrendingTopics() {
    const topics = await Blog.aggregate([
      { $match: { draft: false, isActive: true } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    return topics.map((topic) => topic._id);
  }

  async getTopContributors() {
    const contributors = await User.find({ "personal_info.role": { $ne: "ADMIN" } })
      .select(
        "personal_info.fullname personal_info.username personal_info.profile_img account_info.total_posts account_info.total_reads"
      )
      .sort({ "account_info.total_reads": -1, "account_info.total_posts": -1 })
      .limit(5);

    return contributors;
  }

  async getAllLatestBlogsCount(currentUserId = null) {
    const forbiddenGroupIds = await this.getForbiddenGroupIds(currentUserId);
    return await Blog.countDocuments({
      draft: false,
      isActive: true,
      $or: [
        { group: null },
        { group: { $nin: forbiddenGroupIds } }
      ]
    });
  }

  async getTrendingBlogs(currentUserId = null) {
    const forbiddenGroupIds = await this.getForbiddenGroupIds(currentUserId);
    return await Blog.find({
      draft: false,
      isActive: true,
      $or: [
        { group: null },
        { group: { $nin: forbiddenGroupIds } }
      ]
    })
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname")
      .sort({
        "activity.total_reads": -1,
        "activity.total_likes": -1,
        "activity.total_share": -1,
        "activity.total_comments": -1,
        publishedAt: -1,
      })
      .select("blog_id title publishedAt")
      .limit(10);
  }

  async searchBlogs({ tag, query, author, page, limit, eliminate_blog, currentUserId = null }) {
    let findQuery;
    if (tag) {
      findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };
    } else if (author) {
      findQuery = { author, draft: false };
    }

    const forbiddenGroupIds = await this.getForbiddenGroupIds(currentUserId);
    let maxLimit = limit ? limit : 2;
    const blogs = await Blog.find({
      ...findQuery,
      isActive: true,
      $or: [
        { group: null },
        { group: { $nin: forbiddenGroupIds } }
      ]
    })
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname")
      .populate("group", "name avatar banner isPrivate")
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt group")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return await this.attachGroupMemberships(blogs, currentUserId);
  }

  async searchBlogsCount({ tag, author, query, currentUserId = null }) {
    let findQuery;
    if (tag) {
      findQuery = { tags: tag, draft: false };
    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };
    } else if (author) {
      findQuery = { author, draft: false };
    }
    const forbiddenGroupIds = await this.getForbiddenGroupIds(currentUserId);
    return await Blog.countDocuments({
      ...findQuery,
      isActive: true,
      $or: [
        { group: null },
        { group: { $nin: forbiddenGroupIds } }
      ]
    });
  }

  async trackInterest(userId, tags) {
    if (!tags || !tags.length) return "no tags";
    const normalizedTags = [...new Set(tags.map((tag) => tag?.trim()?.toLowerCase()).filter(Boolean))];

    await Promise.all(
      normalizedTags.map((tag) =>
        UserInterest.findOneAndUpdate(
          { user: userId, tag },
          { $inc: { score: 1 }, $set: { lastInteractedAt: new Date() } },
          { upsert: true, new: true }
        )
      )
    );
    return "done";
  }

  async shareBlog(blog_id, userId, { share_url, share_img, share_type }) {
    const blog = await Blog.findOneAndUpdate({ _id: blog_id }, { $inc: { "activity.total_share": 1 } });
    if (!blog) throw new Error("Blog not found");

    EE.emit("publish-notification", {
      type: "share",
      blog: blog_id,
      notification_for: blog.author,
      user: userId,
      metadata: { share_url, share_img, share_type },
    });
    return { shared_by_user: true };
  }

  async likeBlog(blogId, userId, islikedByUser) {
    let incrementVal = !islikedByUser ? 1 : -1;
    const blog = await Blog.findOneAndUpdate({ _id: blogId }, { $inc: { "activity.total_likes": incrementVal } });
    if (!blog) throw new Error("Blog not found");

    if (!islikedByUser) {
      if (userId != blog.author) {
        EE.emit("publish-notification", {
          type: "like",
          blog: blogId,
          notification_for: blog.author,
          user: userId,
        });
      }
      return { liked_by_user: true };
    } else {
      await Notification.findOneAndDelete({ user: userId, blog: blogId, type: "like" });
      return { liked_by_user: false };
    }
  }

  async isLikedByUser(blogId, userId) {
    const result = await Notification.exists({ user: userId, type: "like", blog: blogId });
    return !!result;
  }

  async getUserWrittenBlogs(userId, { page, query, deletedDocCount, filter }) {
    let maxLimit = 5;
    let skipDocs = (page - 1) * maxLimit;
    if (deletedDocCount) skipDocs -= deletedDocCount;

    let findQuery = { author: userId, title: new RegExp(query, "i") };
    if (filter === 'pending') {
      findQuery.draft = false;
      findQuery.isActive = false;
    } else if (filter === 'draft') {
      findQuery.draft = true;
    } else {
      findQuery.draft = false;
      findQuery.isActive = true;
    }

    return await Blog.find(findQuery)
      .skip(skipDocs)
      .limit(maxLimit)
      .sort({ publishedAt: -1 })
      .populate("group", "name avatar banner")
      .select("title banner publishedAt blog_id activity des draft isActive group -_id");
  }

  async getUserWrittenBlogsCount(userId, { query, filter }) {
    let findQuery = { author: userId, title: new RegExp(query, "i") };
    if (filter === 'pending') {
      findQuery.draft = false;
      findQuery.isActive = false;
    } else if (filter === 'draft') {
      findQuery.draft = true;
    } else {
      findQuery.draft = false;
      findQuery.isActive = true;
    }
    return await Blog.countDocuments(findQuery);
  }

  async saveBlog(userId, blog_id, collection_id = null) {
    const blog = await Blog.findOne({ blog_id });
    if (!blog) throw new Error("Blog not found");

    const existingSave = await SavedBlog.findOne({ user: userId, blog: blog._id });
    if (existingSave) {
      if (collection_id !== undefined && String(existingSave.collection_id) !== String(collection_id)) {
        // If it's already saved but user wants to move it to a different collection
        existingSave.collection_id = collection_id;
        await existingSave.save();
        return { saved_status: true, moved: true };
      } else {
        // Toggle save
        await SavedBlog.findOneAndDelete({ _id: existingSave._id });
        return { saved_status: false };
      }
    } else {
      await new SavedBlog({ user: userId, blog: blog._id, collection_id }).save();
      return { saved_status: true };
    }
  }

  async getSavedBlogs(userId, page = 1, limit = 5, collection_id = null, type = "all", sort = "desc") {
    const maxLimit = parseInt(limit) || 5;
    const pageNumber = parseInt(page) || 1;
    const skipDocs = (pageNumber - 1) * maxLimit;

    const matchQuery = { user: new mongoose.Types.ObjectId(userId) };
    if (collection_id) {
      if (collection_id === "default") {
        matchQuery.collection_id = null;
      } else {
        matchQuery.collection_id = new mongoose.Types.ObjectId(collection_id);
      }
    }

    const sortOrder = sort === "asc" ? 1 : -1;

    const pipeline = [
      {
        $match: matchQuery
      },
      {
        $lookup: {
          from: "blogs",
          localField: "blog",
          foreignField: "_id",
          as: "blogData"
        }
      },
      {
        $unwind: "$blogData"
      },
      {
        $match: {
          "blogData.draft": false,
          "blogData.isActive": true
        }
      }
    ];

    if (type !== "all") {
      if (type === "image") {
        pipeline.push({
          $match: {
            $or: [
              { "blogData.banner": { $nin: ["", "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg", null] } },
              { "blogData.content.blocks.type": "image" }
            ]
          }
        });
      } else if (type === "video") {
        pipeline.push({
          $match: { "blogData.content.blocks.type": "embed" }
        });
      } else if (type === "link") {
        pipeline.push({
          $match: { "blogData.content.blocks.type": "linkTool" }
        });
      }
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "blogData.author",
          foreignField: "_id",
          as: "authorData"
        }
      },
      {
        $unwind: "$authorData"
      },
      {
        $lookup: {
          from: "groups",
          localField: "blogData.group",
          foreignField: "_id",
          as: "groupData"
        }
      },
      {
        $sort: { createdAt: sortOrder }
      },
      {
        $project: {
          _id: "$blogData._id",
          blog_id: "$blogData.blog_id",
          title: "$blogData.title",
          des: "$blogData.des",
          banner: "$blogData.banner",
          activity: "$blogData.activity",
          tags: "$blogData.tags",
          publishedAt: "$blogData.publishedAt",
          collection_id: 1,
          group: {
            $cond: {
              if: { $gt: [{ $size: "$groupData" }, 0] },
              then: {
                _id: { $arrayElemAt: ["$groupData._id", 0] },
                name: { $arrayElemAt: ["$groupData.name", 0] },
                avatar: { $arrayElemAt: ["$groupData.avatar", 0] }
              },
              else: null
            }
          },
          author: {
            _id: "$authorData._id",
            personal_info: {
              profile_img: "$authorData.personal_info.profile_img",
              username: "$authorData.personal_info.username",
              fullname: "$authorData.personal_info.fullname"
            }
          }
        }
      },
      {
        $facet: {
          metadata: [{ $count: "totalDocs" }],
          data: [{ $skip: skipDocs }, { $limit: maxLimit }]
        }
      }
    );

    const result = await SavedBlog.aggregate(pipeline);
    const totalDocs = result[0].metadata[0]?.totalDocs || 0;
    const blogs = result[0].data;

    return { blogs, total: totalDocs, limit: maxLimit, page: pageNumber };
  }

  // --- Collection Methods ---
  async getCollections(userId) {
    const collections = await Collection.find({ user: userId }).sort({ createdAt: -1 });
    return { collections };
  }

  async createCollection(userId, name) {
    if (!name || !name.trim()) throw new Error("Tên bộ sưu tập không được để trống");

    const existing = await Collection.findOne({ user: userId, name: name.trim() });
    if (existing) throw new Error("Tên bộ sưu tập đã tồn tại");

    const newCollection = await new Collection({ user: userId, name: name.trim() }).save();
    return { collection: newCollection, message: "Tạo bộ sưu tập thành công" };
  }

  async updateCollection(userId, collection_id, name) {
    if (!name || !name.trim()) throw new Error("Tên bộ sưu tập không được để trống");

    const existing = await Collection.findOne({ user: userId, name: name.trim(), _id: { $ne: collection_id } });
    if (existing) throw new Error("Tên bộ sưu tập đã tồn tại");

    const updated = await Collection.findOneAndUpdate(
      { _id: collection_id, user: userId },
      { $set: { name: name.trim() } },
      { new: true }
    );
    if (!updated) throw new Error("Bộ sưu tập không tồn tại");
    return { collection: updated, message: "Cập nhật thành công" };
  }

  async deleteCollection(userId, collection_id) {
    const deleted = await Collection.findOneAndDelete({ _id: collection_id, user: userId });
    if (!deleted) throw new Error("Bộ sưu tập không tồn tại");

    // Move all saved blogs in this collection back to default (null)
    await SavedBlog.updateMany(
      { user: userId, collection_id: collection_id },
      { $set: { collection_id: null } }
    );

    return { message: "Xóa bộ sưu tập thành công" };
  }

  async moveSavedBlog(userId, blog_id, collection_id) {
    const blog = await Blog.findOne({ blog_id });
    if (!blog) throw new Error("Blog not found");

    const savedBlog = await SavedBlog.findOne({ user: userId, blog: blog._id });
    if (!savedBlog) throw new Error("Chưa lưu bài viết này");

    // "default" means null
    const targetCollectionId = collection_id === "default" ? null : collection_id;

    if (targetCollectionId) {
      const collectionExists = await Collection.findOne({ _id: targetCollectionId, user: userId });
      if (!collectionExists) throw new Error("Bộ sưu tập không tồn tại");
    }

    savedBlog.collection_id = targetCollectionId;
    await savedBlog.save();

    return { message: "Chuyển bài viết thành công", moved: true };
  }

  async isSavedByUser(userId, blog_id) {
    const blog = await Blog.findOne({ blog_id });
    if (!blog) throw new Error("Blog not found");
    const result = await SavedBlog.exists({ user: userId, blog: blog._id });
    return !!result;
  }

  async getBlogById(blog_id) {
    const blog = await Blog.findOne({ blog_id, isDeleted: { $in: [false, null] } });
    if (!blog) throw new Error("Blog not found");
    return { blog };
  }

  async reportBlog(blog_id, userId) {
    const reportUser = await User.findById(userId);
    if (!reportUser) throw new Error("User not found");
    const blog = await Blog.findOneAndUpdate(
      { blog_id },
      { $set: { isReport: true, reportUser: reportUser._id } }
    );
    if (!blog) throw new Error("Blog not found");
    return { message: "Blog report successfully" };
  }
}

export default new BlogService();
