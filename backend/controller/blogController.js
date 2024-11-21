import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";

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
            $push: { blogs: blog._id },
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

export const deleteBlog = async (req, res) => {
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
