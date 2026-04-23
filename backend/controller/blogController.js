import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import Notification from "../Schema/Notification.js";
import Comment from "../Schema/Comment.js";
import SavedBlog from "../Schema/SavedBlog.js";
import UserFollow from "../Schema/UserFollow.js";

export const createOrUpdateBlog = async (req, res) => {
  try {
    const authorId = req.user.id;
    const { title, des, banner, tags, content, draft, id } = req.body;
    if (!title.length) {
      return res.status(403).json({ error: "You must provide a title" });
    }
    if (!draft) {
      if (!des.length || des.length > 200) {
        return res.status(403).json({
          error: "You must provide blog description under 200 characters",
        });
      }

      if (!banner.length) {
        return res
          .status(403)
          .json({ error: "You must provide blog banner to publish it" });
      }

      if (!content.blocks.length) {
        return res
          .status(403)
          .json({ error: "There must be some blog content to publish it" });
      }

      if (!tags.length || tags.length > 10) {
        return res.status(403).json({
          error: "Provide tags in order to publish the blog, Maximum 10",
        });
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
            title: title,
            des: des,
            banner: banner,
            content: content,
            tags: tags,
            draft: draft ? draft : false,
          },
        }
      );
      return res.status(200).json({ message: "Blog updated successfully" });
    } else {
      const author = await User.findById(authorId);
      const blog = new Blog({
        title,
        des,
        banner,
        content,
        tags,
        author: author._id,
        blog_id,
        draft: Boolean(draft),
        isActive: false,
        isDeleted: false,
      });
      await blog.save().then((blog) => {
        let incrementVal = draft ? 0 : 1;

        User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { "account_info.total_posts": incrementVal },
          }
        )
          .then(() => {
            return res.status(200).json({ id: blog.blog_id });
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ error: "Failed to update total posts number" });
          });
      });
      console.log("Create blog success");
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog_id = req.params.id;
    const blog = await Blog.findOne({
      blog_id,
      isDeleted: { $in: [false, null] },
    });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    return res.status(200).json({ blog });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBlogs = async (req, res) => {
  try {
    const {
      isDraft,
      isActive,
      title,
      tags,
      page = 0,
      limit = 10,
      isReport,
    } = req.query;
    const findQuery = {
      isDeleted: { $in: [false, null] },
    };
    if (isDraft) {
      findQuery.draft = isDraft;
    }
    if (isActive) {
      findQuery.isActive = isActive;
    }
    if (title) {
      findQuery.title = { $regex: title, $options: "i" };
    }
    if (tags) {
      findQuery.tags = { $in: tags };
    }
    if (isReport) {
      findQuery.isReport = isReport;
    }
    const blogs = await Blog.find(findQuery)
      .sort({ publishedAt: -1 })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .populate(
        "reportUser",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .select(
        "blog_id title des banner activity tags publishedAt -_id isActive isDeleted isReport"
      )
      .skip(page * limit)
      .limit(limit);
    const count = await Blog.countDocuments(findQuery);
    return res.status(200).json({ list: blogs, total: count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteBlog1 = async (req, res) => {
  try {
    const blog_id = req.params.id;
    const existingBlog = await Blog.findOne({
      blog_id,
      isDeleted: { $in: [false, null] },
    });
    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    await Blog.findOneAndUpdate({ blog_id }, { $set: { isDeleted: true } });
    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog_id = req.params.id;

    const existingBlog = await Blog.findOne({
      blog_id
    });
    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const blog = await Blog.findOneAndDelete({ blog_id });
    if (!blog) {
      return res.status(404).json({ error: "Unable to delete blog" });
    }

    const notifications = await Notification.find({ blog: blog._id });
    if (notifications.length > 0) {
      await Notification.deleteMany({ blog: blog._id });
      console.log("Notifications deleted");
    } else {
      console.log("No notifications to delete");
    }

    const comments = await Comment.find({ blog_id: blog._id });
    if (comments.length > 0) {
      await Comment.deleteMany({ blog_id: blog._id });
      console.log("Comments deleted");
    } else {
      console.log("No comments to delete");
    }
    const user_id = blog.author;
    await User.findOneAndUpdate(
      { _id: user_id },
      {
        $inc: { "account_info.total_posts": -1 },
      }
    );
    console.log("User's blog count updated");

    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error.message);
    return res.status(500).json({ error: error.message });
  }
};


export const activateBlog = async (req, res) => {
  try {
    const blog_id = req.params.id;
    const existingBlog = await Blog.findOne({
      blog_id,
      isDeleted: { $in: [false, null] },
    });
    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    await Blog.findOneAndUpdate(
      { blog_id },
      { $set: { isActive: !existingBlog.isActive } }
    );
    return res.status(200).json({ message: "Blog activated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const reportBlog = async (req, res) => {
  try {
    const reportUserId = req.user.id;
    const report = await User.findById(reportUserId);
    const blog_id = req.params.id;
    const existingBlog = await Blog.findOne({
      blog_id,
    });
    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    await Blog.findOneAndUpdate(
      { blog_id },
      { $set: { isReport: true, reportUser: report._id } }
    );
    return res.status(200).json({ message: "Blog report successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const removeReportBlog = async (req, res) => {
  try {
    const blog_id = req.params.id;
    const existingBlog = await Blog.findOne({
      blog_id,
    });
    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    await Blog.findOneAndUpdate(
      { blog_id },
      { $set: { isReport: false, reportUser: null } }
    );
    return res.status(200).json({ message: "Blog report successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getFollowingBlogs = async (req, res) => {
  let user_id = req.user.id;
  let { page = 1 } = req.body;
  let maxLimit = 5;

  try {
    const followDocs = await UserFollow.find({ follower: user_id }).select(
      "following -_id"
    );
    const following = followDocs.map((item) => item.following);

    if (!following.length) {
      return res.status(200).json({ blogs: [] });
    }

    let blogs = await Blog.find({ author: { $in: following }, draft: false, isActive: true })
      .skip((page - 1) * maxLimit)
      .limit(maxLimit)
      .sort({ publishedAt: -1 })
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
      .select("blog_id title des banner activity tags publishedAt -_id");

    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getFollowingBlogsCount = async (req, res) => {
  let user_id = req.user.id;

  try {
    const followDocs = await UserFollow.find({ follower: user_id }).select(
      "following -_id"
    );
    const following = followDocs.map((item) => item.following);

    if (!following.length) {
      return res.status(200).json({ totalDocs: 0 });
    }

    let count = await Blog.countDocuments({ author: { $in: following }, draft: false, isActive: true });
    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const saveBlog = async (req, res) => {
  let user_id = req.user.id;
  let { blog_id } = req.body;

  try {
    let blog = await Blog.findOne({ blog_id });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    let existingSave = await SavedBlog.findOne({ user: user_id, blog: blog._id });

    if (existingSave) {
      await SavedBlog.findOneAndDelete({ _id: existingSave._id });
      return res.status(200).json({ saved_status: false });
    } else {
      await new SavedBlog({ user: user_id, blog: blog._id }).save();
      return res.status(200).json({ saved_status: true });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSavedBlogs = async (req, res) => {
  let user_id = req.user.id;
  let { page = 1 } = req.body;
  let maxLimit = 5;

  try {
    let savedBlogs = await SavedBlog.find({ user: user_id })
      .skip((page - 1) * maxLimit)
      .limit(maxLimit)
      .sort({ createdAt: -1 });

    if (!savedBlogs.length) {
      return res.status(200).json({ blogs: [] });
    }

    let blogIds = savedBlogs.map((item) => item.blog);

    let blogs = await Blog.find({ _id: { $in: blogIds }, draft: false, isActive: true })
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
      .select("blog_id title des banner activity tags publishedAt -_id");

    // Re-sort because $in doesn't preserve order
    const sortedBlogs = blogIds
      .map((id) => blogs.find((blog) => blog._id.toString() === id.toString()))
      .filter((blog) => blog !== undefined);

    return res.status(200).json({ blogs: sortedBlogs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSavedBlogsCount = async (req, res) => {
  let user_id = req.user.id;

  try {
    let count = await SavedBlog.countDocuments({ user: user_id });
    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const isSavedByUser = async (req, res) => {
  let user_id = req.user.id;
  let { blog_id } = req.body;

  try {
    let blog = await Blog.findOne({ blog_id });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    let existingSave = await SavedBlog.exists({ user: user_id, blog: blog._id });
    return res.status(200).json({ result: !!existingSave });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
