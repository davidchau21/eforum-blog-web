import User from "../../Schema/User.js";
import UserAuth from "../../Schema/UserAuth.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

class AdminUserService {
  /**
   * Admin: Create a new user with specific role
   */
  async createUser({ fullname, email, password, role, role_id }) {
    const hashed_password = await bcrypt.hash(password, 10);
    
    // Simple username generation for admin
    let username = email.split("@")[0];
    const isUsernameNotUnique = await User.exists({ "personal_info.username": username });
    if (isUsernameNotUnique) {
      username += nanoid().substring(0, 5);
    }

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
        role,
      },
      role_id,
      verified: true,
    });

    return await user.save();
  }

  /**
   * Admin: Update user details and role
   */
  async updateUser(id, { fullname, role, role_id }) {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    const updateData = {};
    if (fullname) updateData["personal_info.fullname"] = fullname;
    if (role) updateData["personal_info.role"] = role;
    if (role_id) updateData.role_id = role_id;

    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Admin: Get all users with pagination and filters
   */
  async getAllUsers({ page = 0, limit = 10, role, startDate, endDate, query, sortOrder = 'desc' }) {
    const filter = {};
    
    if (role) {
      filter["personal_info.role"] = role;
    }

    if (startDate || endDate) {
      filter.joinedAt = {};
      if (startDate) filter.joinedAt.$gte = new Date(startDate);
      if (endDate) filter.joinedAt.$lte = new Date(endDate);
    }

    if (query) {
      filter.$or = [
        { "personal_info.fullname": new RegExp(query, "i") },
        { "personal_info.email": new RegExp(query, "i") },
        { "personal_info.username": new RegExp(query, "i") },
      ];
    }

    const list = await User.find(filter)
      .select("-personal_info.password")
      .skip(page * limit)
      .limit(limit)
      .sort({ joinedAt: sortOrder === 'asc' ? 1 : -1 })
      .populate("role_id")
      .lean();

    const userIds = list.map(user => user._id);
    
    // Find the latest auth record (session) for each user to determine last_active
    const userAuths = await UserAuth.aggregate([
      { $match: { user_id: { $in: userIds } } },
      { $sort: { updatedAt: -1 } },
      { $group: { _id: "$user_id", last_active: { $first: "$updatedAt" } } }
    ]);

    const authMap = new Map(userAuths.map(auth => [auth._id.toString(), auth.last_active]));

    const mappedList = list.map(user => ({
      ...user,
      last_active: authMap.get(user._id.toString()) || null
    }));
      
    const total = await User.countDocuments(filter);
    return { list: mappedList, total };
  }

  /**
   * Admin: Find user by ID
   */
  async findUserById(id) {
    const user = await User.findById(id).select("-personal_info.password").populate("role_id");
    if (!user) throw new Error("User not found");
    return user;
  }

  /**
   * Admin: Block/Unblock user comments
   */
  async toggleBlockComment(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.blocked_comment = !user.blocked_comment;
    await user.save();
    return { status: user.blocked_comment ? "blocked" : "unblocked" };
  }

  /**
   * Get current admin profile
   */
  async getMyProfile(userId) {
    const user = await User.findById(userId)
      .select("-personal_info.password -google_auth -updatedAt")
      .populate({
        path: "role_id",
        populate: { path: "permissions" }
      });
    if (!user) throw new Error("User not found");
    return user;
  }

  /**
   * Admin: Toggle disable user account
   */
  async toggleDisableUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.disabled = !user.disabled;
    await user.save();
    return { status: user.disabled ? "disabled" : "enabled" };
  }

  /**
   * Admin: Delete user account completely
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new Error("User not found");
    return { status: "deleted" };
  }
}

export default new AdminUserService();
