import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import Notification from "../Schema/Notification.js";
import Comment from "../Schema/Comment.js";
import SavedBlog from "../Schema/SavedBlog.js";
import UserFollow from "../Schema/UserFollow.js";
import UserInterest from "../Schema/UserInterest.js";
import EE from "../socket/eventManager.js";

class BlogService {
  /**
   * Create or update a blog post
   */
  async createOrUpdateBlog({ authorId, title, des, banner, tags, content, draft, id }) {
    if (!title.length) {
      throw new Error("You must provide a title");
    }

    if (!draft) {
      if (des && des.length > 200) {
        throw new Error("Blog description must be under 200 characters");
      }
      if (!banner || !banner.length) {
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
      await Blog.findOneAndUpdate(
        { blog_id },
        {
          $set: {
            title,
            des,
            banner,
            content,
            tags,
            draft: draft ? draft : false,
          },
        }
      );
      return { id: blog_id, message: "Blog updated successfully" };
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
        isActive: false, // Default to inactive until admin approves (if that's the flow)
        isDeleted: false,
      });

      const savedBlog = await blog.save();
      let incrementVal = draft ? 0 : 1;

      await User.findOneAndUpdate(
        { _id: authorId },
        { $inc: { "account_info.total_posts": incrementVal } }
      );

      return { id: savedBlog.blog_id };
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
      .select("title des content banner activity publishedAt blog_id tags isReport isActive draft");

    if (!blog) {
      throw new Error("Blog not found");
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
    // Basic implementation - can be enhanced with interests later
    const blogs = await Blog.find({ draft: false, isActive: true })
      .populate({
        path: "author",
        match: { "personal_info.role": { $ne: "ADMIN" } },
        select: "personal_info.profile_img personal_info.username personal_info.fullname",
      })
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt")
      .skip((page - 1) * limit)
      .limit(limit);

    const filteredBlogs = blogs
      .filter((blog) => blog.author && blog.author.personal_info.role !== "ADMIN")
      .map((blog) => {
        const isFollowingAuthor = currentUserId && followingIds.includes(blog.author._id.toString());
        return { ...blog.toObject(), isFollowingAuthor };
      });

    return { blogs: filteredBlogs };
  }

  async getFollowingBlogs(userId, page = 1) {
    let maxLimit = 5;
    const followDocs = await UserFollow.find({ follower: userId }).select("following -_id");
    const following = followDocs.map((item) => item.following);

    if (!following.length) return { blogs: [] };

    const blogs = await Blog.find({ author: { $in: following }, draft: false, isActive: true })
      .skip((page - 1) * maxLimit)
      .limit(maxLimit)
      .sort({ publishedAt: -1 })
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
      .select("blog_id title des banner activity tags publishedAt -_id");

    return { blogs };
  }

  async getFollowingBlogsCount(userId) {
    const followDocs = await UserFollow.find({ follower: userId }).select("following -_id");
    const following = followDocs.map((item) => item.following);
    if (!following.length) return 0;
    return await Blog.countDocuments({ author: { $in: following }, draft: false, isActive: true });
  }

  async getAdminBlogs() {
    const blogs = await Blog.find({ draft: false, isActive: true })
      .populate({
        path: "author",
        match: { "personal_info.role": "ADMIN" },
        select: "personal_info.fullname personal_info.username personal_info.profile_img personal_info.role",
      })
      .select("title des content banner activity publishedAt blog_id tags")
      .sort({ publishedAt: -1 });

    return { blogs: blogs.filter((blog) => blog.author !== null) };
  }

  async getAllLatestBlogsCount() {
    return await Blog.countDocuments({ draft: false, isActive: true });
  }

  async getTrendingBlogs() {
    return await Blog.find({ draft: false, isActive: true })
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

  async searchBlogs({ tag, query, author, page, limit, eliminate_blog }) {
    let findQuery;
    if (tag) {
      findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };
    } else if (author) {
      findQuery = { author, draft: false };
    }

    let maxLimit = limit ? limit : 2;
    return await Blog.find({ ...findQuery, isActive: true })
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname")
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);
  }

  async searchBlogsCount({ tag, author, query }) {
    let findQuery;
    if (tag) {
      findQuery = { tags: tag, draft: false };
    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };
    } else if (author) {
      findQuery = { author, draft: false };
    }
    return await Blog.countDocuments({ ...findQuery, isActive: true });
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
      .select("title banner publishedAt blog_id activity des draft isActive -_id");
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

  async saveBlog(userId, blog_id) {
    const blog = await Blog.findOne({ blog_id });
    if (!blog) throw new Error("Blog not found");

    const existingSave = await SavedBlog.findOne({ user: userId, blog: blog._id });
    if (existingSave) {
      await SavedBlog.findOneAndDelete({ _id: existingSave._id });
      return { saved_status: false };
    } else {
      await new SavedBlog({ user: userId, blog: blog._id }).save();
      return { saved_status: true };
    }
  }

  async getSavedBlogs(userId, page = 1) {
    let maxLimit = 5;
    const savedBlogs = await SavedBlog.find({ user: userId })
      .skip((page - 1) * maxLimit)
      .limit(maxLimit)
      .sort({ createdAt: -1 });

    if (!savedBlogs.length) return { blogs: [] };

    const blogIds = savedBlogs.map((item) => item.blog).filter((id) => id);
    const blogs = await Blog.find({ _id: { $in: blogIds }, draft: false, isActive: true })
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
      .select("blog_id title des banner activity tags publishedAt -_id");

    // Preserve order
    const sortedBlogs = blogIds
      .map((id) => blogs.find((blog) => blog && blog._id.toString() === id.toString()))
      .filter(Boolean);

    return { blogs: sortedBlogs };
  }

  async getSavedBlogsCount(userId) {
    return await SavedBlog.countDocuments({ user: userId });
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
