import Tag from "../../Schema/Tag.js";

class AdminTagService {
  async updateTag(id, { tag_name, is_disabled }) {
    const existingTag = await Tag.findOne({ tag_name });
    if (existingTag && existingTag._id.toString() !== id) {
      throw new Error("Tag name already exists");
    }
    return await Tag.findByIdAndUpdate(id, { tag_name, is_disabled }, { new: true });
  }

  async deleteTag(id) {
    return await Tag.findByIdAndDelete(id);
  }
}

export default new AdminTagService();
