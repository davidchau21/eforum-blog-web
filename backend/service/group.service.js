import Group from "../Schema/Group.js";
import GroupMember from "../Schema/GroupMember.js";
import Blog from "../Schema/Blog.js";
import Document from "../Schema/Document.js";
import EE from "../socket/eventManager.js";

class GroupService {
  /**
   * Create a new group
   */
  async createGroup(userId, data) {
    const { name, description, avatar, banner, isPrivate, rules, invitedUserIds } = data;

    if (!name || name.trim() === "") {
      throw new Error("Tên nhóm không được để trống.");
    }

    const group = new Group({
      name: name.trim(),
      description: (description || "").trim(),
      avatar: avatar || "",
      banner: banner || "",
      isPrivate: !!isPrivate,
      rules: Array.isArray(rules) && rules.length > 0
        ? rules.map(r => r.trim()).filter(Boolean)
        : [
          "Tôn trọng các thành viên khác, không công kích cá nhân.",
          "Chia sẻ tài liệu học tập chất lượng, ghi rõ nguồn nếu sưu tầm.",
          "Không đăng bài quảng cáo, spam, hoặc tin nhắn rác."
        ],
      creator: userId,
    });

    await group.save();

    // Automatically add creator as OWNER with status JOINED
    const member = new GroupMember({
      group: group._id,
      user: userId,
      role: "OWNER",
      status: "JOINED",
    });

    await member.save();

    // Invite/add initial members selected during group creation
    if (Array.isArray(invitedUserIds) && invitedUserIds.length > 0) {
      const uniqueInvitedIds = [...new Set(invitedUserIds)].filter(id => id.toString() !== userId.toString());
      const memberDocs = uniqueInvitedIds.map(invitedId => ({
        group: group._id,
        user: invitedId,
        role: "MEMBER",
        status: "JOINED"
      }));
      if (memberDocs.length > 0) {
        await GroupMember.insertMany(memberDocs);
      }
    }

    return {
      group,
      membership: member,
    };
  }

  /**
   * Get paginated list of public groups (or search them)
   */
  async getGroups(searchQuery, page = 1, limit = 10, userId = null, filter = "all") {
    const skip = (page - 1) * limit;
    const findQuery = {};

    const activeFilter = filter === true || filter === "true" ? "mine" : filter;

    if (activeFilter === "mine" && userId) {
      const userMemberships = await GroupMember.find({ user: userId, status: "JOINED" });
      const joinedGroupIds = userMemberships.map((m) => m.group);
      findQuery._id = { $in: joinedGroupIds };
    } else {
      findQuery.isDisabled = { $ne: true };
      if (activeFilter === "public") {
        findQuery.isPrivate = false;
      } else if (activeFilter === "private") {
        findQuery.isPrivate = true;
      }
    }

    // In search, we match name or description
    if (searchQuery && searchQuery.trim() !== "") {
      findQuery.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const list = await Group.find(findQuery)
      .populate("creator", "personal_info.fullname personal_info.username personal_info.profile_img")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalGroups = await Group.countDocuments(findQuery);

    // Fetch user memberships and member counts for the groups in the list
    const groupIds = list.map((g) => g._id);

    // Aggregated member counts for visible groups
    const memberCounts = await GroupMember.aggregate([
      { $match: { group: { $in: groupIds }, status: "JOINED" } },
      { $group: { _id: "$group", count: { $sum: 1 } } }
    ]);
    const memberCountsMap = memberCounts.reduce((map, item) => {
      map[item._id.toString()] = item.count;
      return map;
    }, {});

    let listWithMembership = list;
    if (userId && list.length > 0) {
      const memberships = await GroupMember.find({
        user: userId,
        group: { $in: groupIds },
      });

      const membershipMap = memberships.reduce((map, m) => {
        map[m.group.toString()] = { role: m.role, status: m.status, muteNotifications: !!m.muteNotifications };
        return map;
      }, {});

      listWithMembership = list.map((g) => {
        const groupObj = g.toObject();
        groupObj.myMembership = membershipMap[g._id.toString()] || null;
        groupObj.totalMembers = memberCountsMap[g._id.toString()] || 0;
        return groupObj;
      });
    } else {
      listWithMembership = list.map((g) => {
        const groupObj = g.toObject();
        groupObj.myMembership = null;
        groupObj.totalMembers = memberCountsMap[g._id.toString()] || 0;
        return groupObj;
      });
    }

    return {
      list: listWithMembership,
      totalGroups,
      page,
      limit,
    };
  }

  /**
   * Get single group details
   */
  async getGroupById(groupId, userId = null) {
    const group = await Group.findById(groupId)
      .populate("creator", "personal_info.fullname personal_info.username personal_info.profile_img");

    if (!group) {
      throw new Error("Nhóm không tồn tại.");
    }

    const groupObj = group.toObject();

    // Check if requester has a membership
    let membership = null;
    if (userId) {
      membership = await GroupMember.findOne({ group: groupId, user: userId });
      groupObj.myMembership = membership ? { role: membership.role, status: membership.status, muteNotifications: !!membership.muteNotifications } : null;
    }

    if (group.isDisabled) {
      const isOwnerOrDeputy = membership && (membership.role === "OWNER" || membership.role === "DEPUTY");
      if (!isOwnerOrDeputy) {
        throw new Error("Nhóm này đã bị vô hiệu hóa tạm thời.");
      }
    }

    // If group is private, content checks are performed in individual endpoints.
    // This allows non-members to view the group header details and request to join.

    // Get count of members
    groupObj.totalMembers = await GroupMember.countDocuments({ group: groupId, status: "JOINED" });

    return groupObj;
  }

  /**
   * Join group
   */
  async joinGroup(groupId, userId) {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new Error("Nhóm không tồn tại.");
    }

    // Check if membership already exists
    const existingMember = await GroupMember.findOne({ group: groupId, user: userId });
    if (existingMember) {
      if (existingMember.status === "JOINED") {
        throw new Error("Bạn đã là thành viên của nhóm này rồi.");
      } else {
        throw new Error("Yêu cầu tham gia nhóm của bạn đang chờ duyệt.");
      }
    }

    const isPrivate = group.isPrivate;
    const newMember = new GroupMember({
      group: groupId,
      user: userId,
      role: "MEMBER",
      status: isPrivate ? "PENDING" : "JOINED",
    });

    await newMember.save();

    if (isPrivate) {
      const groupAdmins = await GroupMember.find({
        group: groupId,
        role: { $in: ["OWNER", "DEPUTY"] },
        status: "JOINED",
        muteNotifications: { $ne: true }
      });
      for (const admin of groupAdmins) {
        EE.emit("publish-notification", {
          type: "group_join_request",
          user: userId,
          notification_for: admin.user,
          group: groupId
        });
      }
    }

    return {
      status: newMember.status,
      message: isPrivate
        ? "Gửi yêu cầu tham gia thành công. Đang chờ Admin duyệt."
        : "Đã tham gia nhóm thành công.",
    };
  }

  /**
   * Leave group
   */
  async leaveGroup(groupId, userId) {
    const member = await GroupMember.findOne({ group: groupId, user: userId });
    if (!member) {
      throw new Error("Bạn không phải là thành viên của nhóm này.");
    }

    // If user is OWNER, check if they are the only OWNER
    if (member.role === "OWNER") {
      const otherOwnersCount = await GroupMember.countDocuments({
        group: groupId,
        role: "OWNER",
        status: "JOINED",
        user: { $ne: userId },
      });

      if (otherOwnersCount === 0) {
        throw new Error("Bạn là Trưởng nhóm duy nhất. Bạn phải chỉ định một Trưởng nhóm khác trước khi rời nhóm.");
      }
    }

    const isPending = member.status === "PENDING";
    await GroupMember.deleteOne({ _id: member._id });
    return { success: true, message: isPending ? "Hủy yêu cầu tham gia thành công." : "Rời nhóm thành công." };
  }

  /**
   * Get group members (paginated)
   */
  async getMembers(groupId, requesterId = null, status = "JOINED", page = 1, limit = 20) {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new Error("Nhóm không tồn tại.");
    }

    // If fetching PENDING requests, requester must be OWNER, DEPUTY or MODERATOR of the group
    if (status === "PENDING") {
      if (!requesterId) {
        throw new Error("Không được phép thực hiện hành động này.");
      }
      const reqMember = await GroupMember.findOne({ group: groupId, user: requesterId });
      if (!reqMember || (reqMember.role !== "OWNER" && reqMember.role !== "DEPUTY" && reqMember.role !== "MODERATOR")) {
        throw new Error("Chỉ Trưởng nhóm, Phó nhóm hoặc Kiểm duyệt viên mới có quyền xem danh sách yêu cầu chờ duyệt.");
      }
    }

    // If group is private, verify requester is a member of the group
    if (group.isPrivate) {
      const reqMember = await GroupMember.findOne({ group: groupId, user: requesterId, status: "JOINED" });
      if (!reqMember) {
        throw new Error("Nhóm riêng tư. Bạn phải là thành viên để xem danh sách.");
      }
    }

    const skip = (page - 1) * limit;
    const list = await GroupMember.find({ group: groupId, status })
      .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img personal_info.email personal_info.bio account_info.total_followers account_info.total_following")
      .skip(skip)
      .limit(limit);

    const total = await GroupMember.countDocuments({ group: groupId, status });

    return {
      list,
      total,
      page,
      limit,
    };
  }

  /**
   * Approve a pending member request
   */
  async approveMemberRequest(groupId, targetUserId, requesterId) {
    // Requester must be OWNER, DEPUTY or MODERATOR
    const requesterMember = await GroupMember.findOne({ group: groupId, user: requesterId, status: "JOINED" });
    if (!requesterMember) {
      throw new Error("Bạn không phải thành viên nhóm.");
    }

    const isOwnerOrDeputy = requesterMember.role === "OWNER" || requesterMember.role === "DEPUTY";
    const isMod = requesterMember.role === "MODERATOR";

    if (!isOwnerOrDeputy && !isMod) {
      throw new Error("Bạn không có quyền duyệt yêu cầu tham gia.");
    }

    if (isMod) {
      const group = await Group.findById(groupId);
      if (!group || !group.settings || !group.settings.moderatorCanApprove) {
        throw new Error("Kiểm duyệt viên không có quyền duyệt thành viên mới trong nhóm này.");
      }
    }

    const targetMember = await GroupMember.findOne({ group: groupId, user: targetUserId, status: "PENDING" });
    if (!targetMember) {
      throw new Error("Không tìm thấy yêu cầu tham gia của người dùng này.");
    }

    targetMember.status = "JOINED";
    await targetMember.save();

    // Trigger join approval notification to approved user
    EE.emit("publish-notification", {
      type: "group_join_approve",
      user: requesterId,
      notification_for: targetUserId,
      group: groupId
    });

    return { success: true, message: "Đã duyệt thành viên thành công." };
  }

  /**
   * Kick member or reject join request
   */
  async removeMember(groupId, targetUserId, requesterId) {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Nhóm không tồn tại.");

    // Requester checks
    const requesterMember = await GroupMember.findOne({ group: groupId, user: requesterId, status: "JOINED" });
    if (!requesterMember) throw new Error("Bạn không phải thành viên nhóm.");

    const targetMember = await GroupMember.findOne({ group: groupId, user: targetUserId });
    if (!targetMember) throw new Error("Không tìm thấy thành viên này trong nhóm.");

    // Self-leave is handled by leaveGroup
    if (targetUserId.toString() === requesterId.toString()) {
      throw new Error("Sử dụng tính năng rời nhóm để rời đi.");
    }

    // Role Hierarchy rules:
    // OWNER can remove anyone.
    // DEPUTY can remove MODERATORS and MEMBERS.
    // MODERATOR can only remove MEMBERS and only if settings.moderatorCanKick is true.
    if (requesterMember.role === "MEMBER") {
      throw new Error("Bạn không có quyền thực hiện hành động này.");
    }

    if (requesterMember.role === "DEPUTY" && targetMember.role === "OWNER") {
      throw new Error("Phó nhóm không có quyền xóa Trưởng nhóm.");
    }

    if (requesterMember.role === "MODERATOR") {
      if (targetMember.role !== "MEMBER") {
        throw new Error("Kiểm duyệt viên chỉ có quyền xóa Thành viên thường.");
      }
      if (!group.settings || !group.settings.moderatorCanKick) {
        throw new Error("Kiểm duyệt viên không có quyền xóa thành viên trong nhóm này.");
      }
    }

    await GroupMember.deleteOne({ _id: targetMember._id });
    return { success: true, message: targetMember.status === "PENDING" ? "Từ chối yêu cầu tham gia thành công." : "Đã xóa thành viên khỏi nhóm." };
  }

  /**
   * Update role of a member (Promote/Demote)
   */
  async updateMemberRole(groupId, targetUserId, newRole, requesterId) {
    if (!["OWNER", "DEPUTY", "MODERATOR", "MEMBER"].includes(newRole)) {
      throw new Error("Vai trò không hợp lệ.");
    }

    // Requester must be OWNER or DEPUTY
    const requesterMember = await GroupMember.findOne({ group: groupId, user: requesterId, status: "JOINED" });
    if (!requesterMember || (requesterMember.role !== "OWNER" && requesterMember.role !== "DEPUTY")) {
      throw new Error("Chỉ Trưởng nhóm hoặc Phó nhóm mới có quyền thay đổi vai trò thành viên.");
    }

    const targetMember = await GroupMember.findOne({ group: groupId, user: targetUserId, status: "JOINED" });
    if (!targetMember) {
      throw new Error("Không tìm thấy thành viên này hoặc họ chưa gia nhập nhóm.");
    }

    // If target is OWNER and newRole is different, ensure requester is OWNER
    if (targetMember.role === "OWNER" && newRole !== "OWNER") {
      if (requesterMember.role !== "OWNER") {
        throw new Error("Chỉ Trưởng nhóm mới có quyền hạ cấp Trưởng nhóm.");
      }
      const otherOwners = await GroupMember.countDocuments({
        group: groupId,
        role: "OWNER",
        status: "JOINED",
        user: { $ne: targetUserId },
      });
      if (otherOwners === 0) {
        throw new Error("Không thể hạ quyền Trưởng nhóm duy nhất. Hãy chuyển quyền Trưởng nhóm trước.");
      }
    }

    // Requester is DEPUTY, they cannot set roles to/from OWNER or DEPUTY
    if (requesterMember.role === "DEPUTY") {
      if (targetMember.role === "OWNER" || targetMember.role === "DEPUTY" || newRole === "OWNER" || newRole === "DEPUTY") {
        throw new Error("Phó nhóm chỉ có quyền điều chỉnh vai trò giữa Kiểm duyệt viên và Thành viên thường.");
      }
    }

    // Requester is OWNER and wants to promote someone to OWNER (Transfer Ownership)
    if (newRole === "OWNER") {
      if (requesterMember.role !== "OWNER") {
        throw new Error("Chỉ Trưởng nhóm mới có quyền chuyển giao vai trò Trưởng nhóm.");
      }
      // Demote the current OWNER (requester) to DEPUTY
      requesterMember.role = "DEPUTY";
      await requesterMember.save();

      // Update group creator field
      const group = await Group.findById(groupId);
      if (group) {
        group.creator = targetUserId;
        await group.save();
      }
    }

    targetMember.role = newRole;
    await targetMember.save();

    // Trigger role change notification to target user
    EE.emit("publish-notification", {
      type: "group_role_change",
      user: requesterId,
      notification_for: targetUserId,
      group: groupId,
      role: newRole
    });

    return { success: true, message: `Cập nhật vai trò thành công sang ${newRole}.` };
  }

  /**
   * Update group settings
   */
  async updateGroupSettings(groupId, settingsData, requesterId) {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Nhóm không tồn tại.");

    const reqMember = await GroupMember.findOne({ group: groupId, user: requesterId, status: "JOINED" });
    if (!reqMember || (reqMember.role !== "OWNER" && reqMember.role !== "DEPUTY")) {
      throw new Error("Chỉ Trưởng nhóm hoặc Phó nhóm mới có quyền thay đổi cài đặt.");
    }

    const allowedKeys = [
      "memberPostApprovalRequired",
      "memberUploadApprovalRequired",
      "moderatorCanKick",
      "moderatorCanApprove",
      "moderatorCanDeletePost"
    ];

    if (!group.settings) {
      group.settings = {};
    }

    for (const key of allowedKeys) {
      if (settingsData[key] !== undefined) {
        group.settings[key] = !!settingsData[key];
      }
    }

    // Support updating group metadata fields if provided
    if (settingsData.name !== undefined) {
      if (!settingsData.name.trim()) throw new Error("Tên nhóm không được để trống.");
      group.name = settingsData.name.trim();
    }
    if (settingsData.description !== undefined) {
      group.description = settingsData.description;
    }
    if (settingsData.avatar !== undefined) {
      group.avatar = settingsData.avatar;
    }
    if (settingsData.banner !== undefined) {
      group.banner = settingsData.banner;
    }
    if (settingsData.isPrivate !== undefined) {
      group.isPrivate = !!settingsData.isPrivate;
    }
    if (settingsData.isDisabled !== undefined) {
      group.isDisabled = !!settingsData.isDisabled;
    }
    if (settingsData.rules !== undefined) {
      if (!Array.isArray(settingsData.rules)) throw new Error("Quy tắc nhóm phải là một mảng.");
      group.rules = settingsData.rules.map(r => r.trim()).filter(Boolean);
    }

    await group.save();
    return {
      success: true,
      settings: group.settings,
      group,
      message: "Cập nhật cài đặt nhóm thành công."
    };
  }

  /**
   * Get group blogs
   */
  async getGroupBlogs(groupId, searchQuery, page = 1, limit = 6, userId = null) {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Nhóm không tồn tại.");

    // Private group checks
    if (group.isPrivate) {
      const member = await GroupMember.findOne({ group: groupId, user: userId, status: "JOINED" });
      if (!member) {
        throw new Error("Nhóm riêng tư. Bạn phải là thành viên để xem bài viết.");
      }
    }

    const skip = (page - 1) * limit;
    const findQuery = { group: groupId, draft: false, isActive: true };

    if (searchQuery && searchQuery.trim() !== "") {
      findQuery.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { des: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const list = await Blog.find(findQuery)
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBlogs = await Blog.countDocuments(findQuery);

    return {
      list,
      totalBlogs,
      page,
      limit,
    };
  }

  /**
   * Get group documents
   */
  async getGroupDocuments(groupId, searchQuery, page = 1, limit = 6, userId = null) {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Nhóm không tồn tại.");

    // Private group checks
    if (group.isPrivate) {
      const member = await GroupMember.findOne({ group: groupId, user: userId, status: "JOINED" });
      if (!member) {
        throw new Error("Nhóm riêng tư. Bạn phải là thành viên để xem tài liệu.");
      }
    }

    const skip = (page - 1) * limit;
    const findQuery = { group: groupId };

    if (searchQuery && searchQuery.trim() !== "") {
      findQuery.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const list = await Document.find(findQuery)
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalDocs = await Document.countDocuments(findQuery);

    return {
      list,
      totalDocs,
      page,
      limit,
    };
  }

  /**
   * Delete group and all associated collections
   */
  async deleteGroup(groupId, userId) {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Nhóm không tồn tại.");

    const member = await GroupMember.findOne({ group: groupId, user: userId, status: "JOINED" });
    if (!member || (member.role !== "OWNER" && member.role !== "DEPUTY")) {
      throw new Error("Chỉ Trưởng nhóm hoặc Phó nhóm mới có quyền xóa nhóm.");
    }

    // Delete group metadata
    await Group.deleteOne({ _id: groupId });

    // Clean up members, posts, documents associated
    await GroupMember.deleteMany({ group: groupId });
    await Document.deleteMany({ group: groupId });
    await Blog.deleteMany({ group: groupId });

    return { success: true, message: "Xóa nhóm thành công." };
  }

  /**
   * Invite / Add a member into the group
   */
  async inviteMember(groupId, targetUserId, requesterId) {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Nhóm không tồn tại.");
    if (group.isDisabled) throw new Error("Nhóm học tập đang bị vô hiệu hóa.");

    // Requester must be a joined member of the group (allows anyone to invite)
    const requesterMember = await GroupMember.findOne({ group: groupId, user: requesterId, status: "JOINED" });
    if (!requesterMember) {
      throw new Error("Bạn không phải thành viên nhóm để thực hiện thao tác này.");
    }

    const existingMember = await GroupMember.findOne({ group: groupId, user: targetUserId });
    if (existingMember) {
      if (existingMember.status === "JOINED") {
        throw new Error("Người dùng này đã là thành viên nhóm rồi.");
      } else {
        throw new Error("Người dùng này đã gửi yêu cầu gia nhập hoặc đang chờ duyệt.");
      }
    }

    const newMember = new GroupMember({
      group: groupId,
      user: targetUserId,
      role: "MEMBER",
      status: "JOINED"
    });

    await newMember.save();
    return { success: true, message: "Đã thêm thành viên mới vào nhóm thành công." };
  }

  /**
   * Toggle mute notifications for a group member
   */
  async toggleMuteNotifications(groupId, userId) {
    const member = await GroupMember.findOne({ group: groupId, user: userId, status: "JOINED" });
    if (!member) {
      throw new Error("Bạn không phải thành viên nhóm.");
    }
    member.muteNotifications = !member.muteNotifications;
    await member.save();
    return {
      success: true,
      muteNotifications: member.muteNotifications,
      message: member.muteNotifications
        ? "Đã tắt thông báo của nhóm này."
        : "Đã bật thông báo của nhóm này."
    };
  }

  /**
   * Get pending group blogs (awaiting approval)
   */
  async getPendingBlogs(groupId, requesterId) {
    const requesterMember = await GroupMember.findOne({ group: groupId, user: requesterId, status: "JOINED" });
    if (!requesterMember || (requesterMember.role !== "OWNER" && requesterMember.role !== "DEPUTY" && requesterMember.role !== "MODERATOR")) {
      throw new Error("Chỉ Trưởng nhóm, Phó nhóm hoặc Kiểm duyệt viên mới có quyền xem bài viết chờ duyệt.");
    }

    const list = await Blog.find({ group: groupId, draft: false, isActive: false })
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
      .sort({ createdAt: -1 });

    return { list };
  }

  /**
   * Approve a pending group blog post
   */
  async approveGroupBlog(groupId, blogId, requesterId) {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Nhóm không tồn tại.");

    const requesterMember = await GroupMember.findOne({ group: groupId, user: requesterId, status: "JOINED" });
    if (!requesterMember) throw new Error("Bạn không phải thành viên nhóm.");

    const isOwnerOrDeputy = requesterMember.role === "OWNER" || requesterMember.role === "DEPUTY";
    const isMod = requesterMember.role === "MODERATOR";

    if (!isOwnerOrDeputy && !isMod) {
      throw new Error("Bạn không có quyền duyệt bài viết.");
    }

    if (isMod) {
      if (!group.settings || !group.settings.moderatorCanApprove) {
        throw new Error("Kiểm duyệt viên không có quyền duyệt bài viết trong nhóm này.");
      }
    }

    const blog = await Blog.findOne({ _id: blogId, group: groupId, isActive: false });
    if (!blog) {
      throw new Error("Không tìm thấy bài viết chờ duyệt này.");
    }

    blog.isActive = true;
    blog.publishedAt = new Date();
    await blog.save();

    // Trigger group_new_post notification to other members
    try {
      const groupMembers = await GroupMember.find({
        group: groupId,
        status: "JOINED",
        user: { $ne: blog.author },
        muteNotifications: { $ne: true }
      });

      for (const member of groupMembers) {
        EE.emit("publish-notification", {
          type: "group_new_post",
          user: blog.author,
          notification_for: member.user,
          group: groupId,
          blog: blog._id
        });
      }
    } catch (err) {
      console.error("Failed to send group new post notifications on approval:", err.message);
    }

    return { success: true, message: "Phê duyệt bài viết thành công." };
  }

  /**
   * Reject (delete) a pending group blog post
   */
  async rejectGroupBlog(groupId, blogId, requesterId) {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Nhóm không tồn tại.");

    const requesterMember = await GroupMember.findOne({ group: groupId, user: requesterId, status: "JOINED" });
    if (!requesterMember) throw new Error("Bạn không phải thành viên nhóm.");

    const isOwnerOrDeputy = requesterMember.role === "OWNER" || requesterMember.role === "DEPUTY";
    const isMod = requesterMember.role === "MODERATOR";

    if (!isOwnerOrDeputy && !isMod) {
      throw new Error("Bạn không có quyền từ chối bài viết.");
    }

    if (isMod) {
      if (!group.settings || !group.settings.moderatorCanDeletePost) {
        throw new Error("Kiểm duyệt viên không có quyền xóa bài viết trong nhóm này.");
      }
    }

    const blog = await Blog.findOne({ _id: blogId, group: groupId, isActive: false });
    if (!blog) {
      throw new Error("Không tìm thấy bài viết chờ duyệt này.");
    }

    await Blog.deleteOne({ _id: blog._id });
    return { success: true, message: "Từ chối bài viết thành công." };
  }
}

export default new GroupService();
