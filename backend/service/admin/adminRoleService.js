import Role from "../../Schema/Role.js";
import Permission from "../../Schema/Permission.js";

class AdminRoleService {
  /**
   * Retrieves all roles with populated permissions.
   */
  async getAllRoles() {
    return await Role.find()
      .populate("permissions")
      .sort({ createdAt: 1 });
  }

  /**
   * Retrieves all permissions.
   */
  async getAllPermissions() {
    const list = await Permission.find().sort({ module_name: 1, permission_code: 1 });
    // Group permissions by module_name for easier matrix rendering on frontend
    const grouped = {};
    list.forEach(perm => {
      if (!grouped[perm.module_name]) {
        grouped[perm.module_name] = [];
      }
      grouped[perm.module_name].push(perm);
    });
    return { list, grouped };
  }

  /**
   * Creates a new custom role.
   */
  async createRole({ role_name, description = "", permissions = [] }) {
    // Check if role name already exists
    const existing = await Role.findOne({ role_name });
    if (existing) {
      throw new Error(`Tên vai trò "${role_name}" đã tồn tại!`);
    }

    const newRole = new Role({
      role_name,
      description,
      permissions
    });

    return await newRole.save();
  }

  /**
   * Updates an existing role's permissions or description.
   */
  async updateRolePermissions(roleId, { permissions, description }) {
    const updateData = {};
    if (permissions !== undefined) updateData.permissions = permissions;
    if (description !== undefined) updateData.description = description;

    const updatedRole = await Role.findByIdAndUpdate(
      roleId,
      { $set: updateData },
      { new: true }
    ).populate("permissions");

    if (!updatedRole) {
      throw new Error("Không tìm thấy vai trò cần cập nhật!");
    }

    return updatedRole;
  }

  /**
   * Deletes a custom role.
   */
  async deleteRole(roleId) {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error("Không tìm thấy vai trò cần xóa!");
    }

    // Do not allow deleting core roles
    const coreRoles = ["Super Admin", "Admin", "Contributor", "User"];
    if (coreRoles.includes(role.role_name)) {
      throw new Error(`Không thể xóa vai trò mặc định: "${role.role_name}"!`);
    }

    return await Role.findByIdAndDelete(roleId);
  }
}

export default new AdminRoleService();
