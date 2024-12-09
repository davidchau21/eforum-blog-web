import Tag from "../Schema/Tag.js";
export const createTag = async (req, res, next) => {
  try {
    const { tag_name } = req.body;
    const existingTag = await Tag.findOne({ tag_name });
    if (existingTag) {
      return res.status(201).json({ message: "Tag already exists" });
    }
    const tag = await Tag.create({ tag_name });
    return res.status(200).json(tag);
  } catch (error) {
    return next(error);
  }
};

export const getAllTags = async (req, res, next) => {
  try {
    const { page = 0, limit = 10 } = req.query;
    const tags = await Tag.find()
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);
    const totalTags = await Tag.countDocuments();
    return res.status(200).json({ list: tags, total: totalTags });
  } catch (error) {
    return next(error);
  }
};

export const updateTag = async (req, res, next) => {
  try {
    const { tag_name, is_disabled } = req.body;
    const { id } = req.params;
    const existingTag = await Tag.findOne({ tag_name });
    const updateTag = await Tag.findById(id);
    if (existingTag && updateTag._id !== existingTag._id) {
      return res.status(400).json({ message: "Tag name already exists" });
    }
    await Tag.findByIdAndUpdate(id, { tag_name, is_disabled });
    return res.status(200).json({ message: "Tag updated successfully" });
  } catch (error) {
    return next(error);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Tag.findByIdAndDelete(id);
    return res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const getTagById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tag = await Tag.findById(id);
    return res.status(200).json(tag);
  } catch (error) {
    return next(error);
  }
};
