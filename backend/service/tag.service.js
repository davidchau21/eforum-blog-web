import Tag from "../Schema/Tag.js";

class TagService {
  async createTag(tag_name) {
    const existingTag = await Tag.findOne({ tag_name });
    if (existingTag) throw new Error("Tag already exists");
    return await Tag.create({ tag_name });
  }

  async getAllTags({ page = 0, limit = 10 }) {
    const tags = await Tag.find()
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);
    const total = await Tag.countDocuments();
    return { list: tags, total };
  }

  async getTagById(id) {
    const tag = await Tag.findById(id);
    if (!tag) throw new Error("Tag not found");
    return tag;
  }
}

export default new TagService();
