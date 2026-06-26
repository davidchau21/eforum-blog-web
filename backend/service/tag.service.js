import Tag from "../Schema/Tag.js";

class TagService {
  async createTag(tag_name) {
    const existingTag = await Tag.findOne({ tag_name });
    if (existingTag) throw new Error("Tag already exists");
    return await Tag.create({ tag_name });
  }

  async getAllTags({ page = 0, limit = 10 }) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    const pipeline = [
      { $sort: { createdAt: -1 } }
    ];

    if (limitNum > 0) {
      pipeline.push({ $skip: pageNum * limitNum });
      pipeline.push({ $limit: limitNum });
    }

    pipeline.push(
      {
        $lookup: {
          from: "blogs",
          localField: "tag_name",
          foreignField: "tags",
          as: "blogs",
        },
      },
      {
        $addFields: {
          total_posts: { $size: "$blogs" },
        },
      },
      {
        $project: {
          blogs: 0,
        },
      }
    );

    const tags = await Tag.aggregate(pipeline);
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
