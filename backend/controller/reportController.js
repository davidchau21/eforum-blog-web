import Blog from "../Schema/Blog.js";
import Comment from "../Schema/Comment.js";
import User from "../Schema/User.js";

export const totalUser = async (req, res) => {
  try {
    const totalUser = await User.countDocuments();
    return res.status(200).json({ totalUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const totalBlog = async (req, res) => {
  try {
    const totalBlog = await Blog.countDocuments({
      isDeleted: { $in: [false, null] },
    });
    return res.status(200).json({ totalBlog });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const totalComment = async (req, res) => {
  try {
    const totalComment = await Comment.countDocuments();
    return res.status(200).json({ totalComment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

