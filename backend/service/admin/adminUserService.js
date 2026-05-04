import User from "../../Schema/User.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

class AdminUserService {
  /**
   * Admin: Create a new user with specific role
   */
  async createUser({ fullname, email, password, role }) {
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
      verified: true,
    });

    return await user.save();
  }

  /**
   * Admin: Update user details and role
   */
  async updateUser(id, { fullname, role }) {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    const updateData = {};
    if (fullname) updateData["personal_info.fullname"] = fullname;
    if (role) updateData["personal_info.role"] = role;

    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Admin: Get all users with pagination
   */
  async getAllUsers({ page = 0, limit = 10 }) {
    const list = await User.find()
      .select("-personal_info.password")
      .skip(page * limit)
      .limit(limit)
      .sort({ joinedAt: -1 });
    const total = await User.countDocuments();
    return { list, total };
  }

  /**
   * Admin: Find user by ID
   */
  async findUserById(id) {
    const user = await User.findById(id).select("-personal_info.password");
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
}

export default new AdminUserService();
