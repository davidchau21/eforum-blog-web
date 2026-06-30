import Group from "../../Schema/Group.js";
import GroupMember from "../../Schema/GroupMember.js";
import Blog from "../../Schema/Blog.js";
import Comment from "../../Schema/Comment.js";
import Notification from "../../Schema/Notification.js";
import Document from "../../Schema/Document.js";

class AdminGroupService {
  /**
   * Admin: Get all groups with filters and statistics
   */
  async getAllGroupsForAdmin({ name, isDisabled, page = 0, limit = 10 }) {
    const query = {};
    if (name) query.name = { $regex: name, $options: "i" };
    if (isDisabled !== undefined) {
      query.isDisabled = isDisabled === "true" || isDisabled === true;
    }

    const groups = await Group.find(query)
      .sort({ createdAt: -1 })
      .populate("creator", "personal_info.username personal_info.fullname personal_info.profile_img")
      .skip(page * limit)
      .limit(limit);

    const [total, totalActive, totalDisabled, totalPrivate] = await Promise.all([
      Group.countDocuments(query),
      Group.countDocuments({ isDisabled: false }),
      Group.countDocuments({ isDisabled: true }),
      Group.countDocuments({ isPrivate: true }),
    ]);

    // Attach member count and post count for each group
    const list = await Promise.all(
      groups.map(async (group) => {
        const memberCount = await GroupMember.countDocuments({
          group: group._id,
          status: "JOINED",
        });
        const postCount = await Blog.countDocuments({
          group: group._id,
          draft: false,
          isDeleted: { $in: [false, null] },
        });
        return {
          ...group.toObject(),
          memberCount,
          postCount,
        };
      })
    );

    return { list, total, totalActive, totalDisabled, totalPrivate };
  }

  /**
   * Admin: Toggle group disabled status
   */
  async toggleGroupStatus(groupId) {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Nhóm học tập không tồn tại.");
    group.isDisabled = !group.isDisabled;
    await group.save();
    return {
      message: group.isDisabled
        ? "Đã vô hiệu hóa nhóm học tập thành công."
        : "Đã kích hoạt lại nhóm học tập thành công.",
      isDisabled: group.isDisabled,
    };
  }

  /**
   * Admin: Permanently delete a group and all associated data
   */
  async deleteGroup(groupId) {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Nhóm học tập không tồn tại.");

    // 1. Get all blogs in this group
    const blogs = await Blog.find({ group: groupId });
    const blogIds = blogs.map((b) => b._id);

    // 2. Delete all comments on those blogs
    if (blogIds.length > 0) {
      await Comment.deleteMany({ blog_id: { $in: blogIds } });
      await Notification.deleteMany({ blog: { $in: blogIds } });
      await Blog.deleteMany({ group: groupId });
    }

    // 3. Delete group documents
    await Document.deleteMany({ group: groupId });

    // 4. Delete all group memberships
    await GroupMember.deleteMany({ group: groupId });

    // 5. Delete the group itself
    await Group.findByIdAndDelete(groupId);

    return { message: "Đã xóa vĩnh viễn nhóm học tập và toàn bộ dữ liệu liên quan." };
  }
}

export default new AdminGroupService();
