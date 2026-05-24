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

  /**
   * Creates a new dynamic permission.
   */
  async createPermission({ permission_name, permission_code, module_name }) {
    if (!permission_name || !permission_code || !module_name) {
      throw new Error("Tất cả các trường thông tin (tên, mã, nhóm) quyền hạn đều bắt buộc!");
    }

    // Check if permission code already exists
    const existing = await Permission.findOne({ permission_code });
    if (existing) {
      throw new Error(`Mã quyền "${permission_code}" đã tồn tại trên hệ thống!`);
    }

    const newPerm = new Permission({
      permission_name,
      permission_code,
      module_name
    });

    return await newPerm.save();
  }

  /**
   * Updates an existing permission.
   */
  async updatePermission(permissionId, { permission_name, permission_code, module_name }) {
    const updateData = {};
    if (permission_name !== undefined) updateData.permission_name = permission_name;
    if (permission_code !== undefined) {
      // Check code uniqueness if changing
      const existing = await Permission.findOne({ permission_code, _id: { $ne: permissionId } });
      if (existing) {
        throw new Error(`Mã quyền "${permission_code}" đã tồn tại!`);
      }
      updateData.permission_code = permission_code;
    }
    if (module_name !== undefined) updateData.module_name = module_name;

    const updatedPerm = await Permission.findByIdAndUpdate(
      permissionId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedPerm) {
      throw new Error("Không tìm thấy quyền hạn cần cập nhật!");
    }

    return updatedPerm;
  }

  /**
   * Deletes a permission and cleans up its association with any roles.
   */
  async deletePermission(permissionId) {
    const perm = await Permission.findById(permissionId);
    if (!perm) {
      throw new Error("Không tìm thấy quyền hạn cần xóa!");
    }

    // Check if it's a critical system core permission (e.g. ROLE_MANAGE) to prevent locking out Super Admins
    if (perm.permission_code === "ROLE_MANAGE") {
      throw new Error("Không thể xóa quyền quản trị hệ thống cốt lõi [ROLE_MANAGE]!");
    }

    // 1. Remove this permission reference from all roles
    await Role.updateMany(
      {},
      { $pull: { permissions: permissionId } }
    );

    // 2. Delete the permission itself
    await Permission.findByIdAndDelete(permissionId);
    return perm;
  }
}

export default new AdminRoleService();
