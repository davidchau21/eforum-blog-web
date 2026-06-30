import { useState, useEffect } from "react";
import { uploadImage } from "../../common/aws";
import { toast } from "react-hot-toast";
import { GroupConfirmModal } from "./group-confirm-modal.component";
import groupBannerDefault from "../../imgs/group-banner-default.png";

/* eslint-disable react/prop-types */
export const GroupSettingsTab = ({
  settingsCategory,
  setSettingsCategory,
  groupEditForm,
  setGroupEditForm,
  settings,
  setSettings,
  isSavingSettings,
  settingsMessage,
  handleSaveSettings,
  handleDeleteGroup,
  myRole,
}) => {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const initialsUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(groupEditForm.name || "Group")}&backgroundColor=b3c5fc`;

  useEffect(() => {
    if (myRole !== "OWNER" && (settingsCategory === "moderator_perms" || settingsCategory === "danger")) {
      setSettingsCategory("basic");
    }
  }, [myRole, settingsCategory, setSettingsCategory]);

  return (
    <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] p-6 shadow-sm flex flex-col md:flex-row gap-8 min-h-[480px]">
      {/* Settings Sidebar (Left Menu) */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-1.5 md:border-r md:border-slate-100 md:dark:border-white/5 md:pr-6">
        <div className="mb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white font-jakarta">
            Cấu hình nhóm
          </h3>
          <p className="text-[10px] text-slate-400">
            Quản lý và điều chỉnh quyền hạn nhóm
          </p>
        </div>

        {[
          {
            id: "basic",
            label: "Thông tin nhóm",
            icon: "fi-rr-info",
          },
          {
            id: "moderation",
            label: "Kiểm duyệt nội dung",
            icon: "fi-rr-shield-check",
          },
          ...(myRole === "OWNER"
            ? [
                {
                  id: "moderator_perms",
                  label: "Phân quyền quản trị",
                  icon: "fi-rr-settings-sliders",
                },
                {
                  id: "danger",
                  label: "Quản lý nâng cao",
                  icon: "fi-rr-exclamation",
                },
              ]
            : []),
          {
            id: "rules",
            label: "Quy định nhóm",
            icon: "fi-rr-list-check",
          },
        ].map((cat) => {
          const isActive = settingsCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSettingsCategory(cat.id)}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold font-jakarta flex items-center gap-2.5 transition-all cursor-pointer relative z-10 pointer-events-auto ${
                isActive
                  ? "bg-slate-950 dark:bg-black text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:text-slate-800 dark:hover:text-black"
              }`}
            >
              <i className={`fi ${cat.icon} text-sm pointer-events-none`}></i>
              <span className="pointer-events-none">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Content Area (Right Side) */}
      <div className="flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          {/* Section 1: Basic Info */}
          {settingsCategory === "basic" && (
            <div className="space-y-4 font-inter text-sm">
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white font-jakarta mb-1">
                  Thông tin cơ bản
                </h4>
                <p className="text-[10px] text-slate-400">
                  Thay đổi tên, mô tả và chế độ hiển thị của cộng đồng học tập
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Tên nhóm học tập *
                  </label>
                  <input
                    type="text"
                    value={groupEditForm.name}
                    onChange={(e) =>
                      setGroupEditForm({
                        ...groupEditForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Tên nhóm học tập..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl py-2.5 px-4 outline-none text-xs font-semibold focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Mô tả nhóm
                  </label>
                  <textarea
                    value={groupEditForm.description}
                    onChange={(e) =>
                      setGroupEditForm({
                        ...groupEditForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Mô tả tóm tắt nội dung & mục tiêu của nhóm học tập..."
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl py-2.5 px-4 outline-none text-xs font-semibold focus:border-indigo-500 transition-all resize-none text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Ảnh đại diện (Avatar)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-white/5 shrink-0 flex items-center justify-center">
                        <img
                          src={groupEditForm.avatar || initialsUrl}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = initialsUrl;
                          }}
                          className="w-full h-full object-cover"
                          alt="avatar"
                        />
                      </div>
                      <label className="flex-grow cursor-pointer">
                        <span className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-xs font-bold text-slate-600 dark:text-slate-350 text-center">
                          <i className="fi fi-rr-upload text-[11px]"></i>
                          Tải ảnh lên
                        </span>
                        <input
                          type="file"
                          accept=".png, .jpg, .jpeg"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const loadingToast = toast.loading(
                              "Đang tải ảnh đại diện lên..."
                            );
                            try {
                              const url = await uploadImage(file);
                              setGroupEditForm((prev) => ({
                                ...prev,
                                avatar: url,
                              }));
                              toast.success("Tải ảnh đại diện thành công!");
                            } catch (err) {
                              toast.error("Không thể tải ảnh đại diện.");
                            } finally {
                              toast.dismiss(loadingToast);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Ảnh bìa (Banner)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-white/5 shrink-0 flex items-center justify-center">
                        <img
                          src={groupEditForm.banner || groupBannerDefault}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = groupBannerDefault;
                          }}
                          className="w-full h-full object-cover"
                          alt="banner"
                        />
                      </div>
                      <label className="flex-grow cursor-pointer">
                        <span className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-xs font-bold text-slate-600 dark:text-slate-350 text-center">
                          <i className="fi fi-rr-upload text-[11px]"></i>
                          Tải ảnh lên
                        </span>
                        <input
                          type="file"
                          accept=".png, .jpg, .jpeg"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const loadingToast = toast.loading(
                              "Đang tải ảnh bìa lên..."
                            );
                            try {
                              const url = await uploadImage(file);
                              setGroupEditForm((prev) => ({
                                ...prev,
                                banner: url,
                              }));
                              toast.success("Tải ảnh bìa thành công!");
                            } catch (err) {
                              toast.error("Không thể tải ảnh bìa.");
                            } finally {
                              toast.dismiss(loadingToast);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    Chế độ hiển thị
                  </label>
                  <div className="flex gap-4">
                    <div
                      className={`flex-1 flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        !groupEditForm.isPrivate
                          ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10"
                          : "border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]"
                      }`}
                      onClick={() =>
                        setGroupEditForm({
                          ...groupEditForm,
                          isPrivate: false,
                        })
                      }
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          !groupEditForm.isPrivate
                            ? "border-indigo-500"
                            : "border-slate-350"
                        }`}
                      >
                        {!groupEditForm.isPrivate && (
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                          <i className="fi fi-rr-globe"></i> Công khai
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5 font-inter">
                          Ai cũng có thể tìm kiếm và gia nhập
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex-1 flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        groupEditForm.isPrivate
                          ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10"
                          : "border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]"
                      }`}
                      onClick={() =>
                        setGroupEditForm({
                          ...groupEditForm,
                          isPrivate: true,
                        })
                      }
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          groupEditForm.isPrivate
                            ? "border-indigo-500"
                            : "border-slate-350"
                        }`}
                      >
                        {groupEditForm.isPrivate && (
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                          <i className="fi fi-rr-lock"></i> Riêng tư
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5 font-inter">
                          Chỉ thành viên được duyệt mới xem được nội dung
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Content Moderation */}
          {settingsCategory === "moderation" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white font-jakarta mb-1">
                  Kiểm duyệt nội dung
                </h4>
                <p className="text-[10px] text-slate-400">
                  Yêu cầu phê duyệt cho các bài đăng thảo luận và tài liệu chia
                  sẻ
                </p>
              </div>
              <div className="space-y-4 pt-2">
                <Toggle
                  enabled={settings.memberPostApprovalRequired}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      memberPostApprovalRequired:
                        !settings.memberPostApprovalRequired,
                    })
                  }
                  label="Duyệt bài viết của thành viên"
                  description="Bài viết thảo luận của thành viên cần được phê duyệt trước khi hiển thị."
                  icon="fi-rr-comment-question"
                />
                <Toggle
                  enabled={settings.memberUploadApprovalRequired}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      memberUploadApprovalRequired:
                        !settings.memberUploadApprovalRequired,
                    })
                  }
                  label="Duyệt tài liệu tải lên"
                  description="Tài liệu tải lên sẽ cần được kiểm duyệt trước khi hiển thị."
                  icon="fi-rr-document-signed"
                />
              </div>
            </div>
          )}

          {/* Section 3: Admin Role Permissions */}
          {settingsCategory === "moderator_perms" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white font-jakarta mb-1">
                  Phân quyền quản trị nhóm
                </h4>
                <p className="text-[10px] text-slate-400">
                  Thiết lập chi tiết quyền hạn cho các vai trò quản lý (Phó nhóm & Kiểm duyệt viên)
                </p>
              </div>

              {/* ── QUYỀN HẠN PHÓ NHÓM (DEPUTY) ── */}
              <div className="space-y-4 pt-2 border-b border-slate-100 dark:border-white/5 pb-6">
                <h5 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">
                  Quyền hạn của Phó nhóm (Vice-Admin)
                </h5>
                <Toggle
                  enabled={settings.deputyCanApprove !== false}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      deputyCanApprove: settings.deputyCanApprove === undefined ? false : !settings.deputyCanApprove,
                    })
                  }
                  label="Phê duyệt bài viết & tài liệu"
                  description="Cho phép phê duyệt hoặc từ chối bài viết, tài liệu học tập của thành viên."
                  icon="fi-rr-document-signed"
                />
                <Toggle
                  enabled={settings.deputyCanKick !== false}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      deputyCanKick: settings.deputyCanKick === undefined ? false : !settings.deputyCanKick,
                    })
                  }
                  label="Duyệt & Xóa thành viên"
                  description="Cho phép xóa thành viên thường, phê duyệt/từ chối yêu cầu gia nhập."
                  icon="fi-rr-delete-user"
                />
                <Toggle
                  enabled={settings.deputyCanDeletePost !== false}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      deputyCanDeletePost: settings.deputyCanDeletePost === undefined ? false : !settings.deputyCanDeletePost,
                    })
                  }
                  label="Gỡ bài viết vi phạm"
                  description="Cho phép xóa hoặc gỡ bỏ các bài viết bị báo cáo của thành viên thường."
                  icon="fi-rr-trash"
                />
                <Toggle
                  enabled={settings.deputyCanChangeSettings !== false}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      deputyCanChangeSettings: settings.deputyCanChangeSettings === undefined ? false : !settings.deputyCanChangeSettings,
                    })
                  }
                  label="Thay đổi cài đặt nhóm"
                  description="Cho phép truy cập Cài đặt nhóm để chỉnh sửa thông tin và cấu hình kiểm duyệt."
                  icon="fi-rr-settings"
                />
              </div>

              {/* ── QUYỀN HẠN KIỂM DUYỆT VIÊN (MODERATOR) ── */}
              <div className="space-y-4 pt-2">
                <h5 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">
                  Quyền hạn của Kiểm duyệt viên (Moderator)
                </h5>
                <Toggle
                  enabled={settings.moderatorCanApprove}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      moderatorCanApprove: !settings.moderatorCanApprove,
                    })
                  }
                  label="Duyệt bài viết & thành viên"
                  description="Cho phép phê duyệt bài đăng chờ duyệt hoặc duyệt yêu cầu gia nhập."
                  icon="fi-rr-user-add"
                />
                <Toggle
                  enabled={settings.moderatorCanKick}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      moderatorCanKick: !settings.moderatorCanKick,
                    })
                  }
                  label="Được xóa thành viên"
                  description="Cho phép xóa thành viên thường khỏi nhóm học tập."
                  icon="fi-rr-delete-user"
                />
                <Toggle
                  enabled={settings.moderatorCanDeletePost}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      moderatorCanDeletePost: !settings.moderatorCanDeletePost,
                    })
                  }
                  label="Được xóa bài viết"
                  description="Cho phép xóa các bài thảo luận của thành viên thường."
                  icon="fi-rr-trash"
                />
              </div>
            </div>
          )}

          {/* Section 4: Group Rules */}
          {settingsCategory === "rules" && (
            <div className="space-y-4 font-inter text-sm animate-in fade-in duration-200">
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white font-jakarta mb-1">
                  Quy định & Quy tắc nhóm
                </h4>
                <p className="text-[10px] text-slate-400">
                  Thiết lập danh sách quy định hiển thị ở trang giới thiệu và thanh bên của nhóm
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Rules List */}
                <div className="space-y-2">
                  {(groupEditForm.rules || []).map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 p-3 rounded-xl hover:border-slate-350 dark:hover:border-white/10 transition-all"
                    >
                      <span className="text-xs font-black text-indigo-500 shrink-0 w-5">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => {
                          const newRules = [...groupEditForm.rules];
                          newRules[idx] = e.target.value;
                          setGroupEditForm({
                            ...groupEditForm,
                            rules: newRules,
                          });
                        }}
                        placeholder="Nội dung quy định..."
                        className="flex-grow bg-transparent outline-none text-xs font-semibold text-slate-700 dark:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newRules = groupEditForm.rules.filter((_, i) => i !== idx);
                          setGroupEditForm({
                            ...groupEditForm,
                            rules: newRules,
                          });
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-all"
                      >
                        <i className="fi fi-rr-trash text-sm"></i>
                      </button>
                    </div>
                  ))}

                  {(!groupEditForm.rules || groupEditForm.rules.length === 0) && (
                    <div className="py-6 text-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                      <p className="text-xs font-medium">Chưa có quy định riêng. Nhóm sẽ sử dụng các quy định mặc định.</p>
                    </div>
                  )}
                </div>

                {/* Add Rule button */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentRules = groupEditForm.rules || [];
                      setGroupEditForm({
                        ...groupEditForm,
                        rules: [...currentRules, ""],
                      });
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-xs font-bold text-slate-500 dark:text-slate-400 text-center cursor-pointer"
                  >
                    <i className="fi fi-rr-plus text-sm"></i>
                    Thêm quy định mới
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Danger Zone */}
          {settingsCategory === "danger" && (
            <div className="space-y-6 font-inter text-sm animate-in fade-in duration-200">
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-black font-jakarta mb-1">
                  Quản lý nâng cao
                </h4>
                <p className="text-[10px] text-slate-400">
                  Thực hiện các thao tác vô hiệu hóa tạm thời hoặc xóa vĩnh viễn cộng đồng học tập
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* 1. Toggle Disable Group */}
                <div className="flex items-start justify-between p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/[0.02] border border-amber-500/10 shadow-sm hover:border-amber-500/20 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm shrink-0 mt-0.5">
                      <i className="fi fi-rr-ban"></i>
                    </div>
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <p className="font-bold text-xs text-amber-600 dark:text-amber-400 font-jakarta">
                        Tạm thời vô hiệu hóa nhóm
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed pr-2">
                        Khi kích hoạt, thành viên thường sẽ không thể xem bài đăng hay tải tài liệu. Chỉ ban quản trị mới có thể xem và tái kích hoạt lại nhóm.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGroupEditForm({
                        ...groupEditForm,
                        isDisabled: !groupEditForm.isDisabled,
                      })
                    }
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 shrink-0 mt-1 ${
                      groupEditForm.isDisabled ? "bg-amber-500" : "bg-slate-300 dark:bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                        groupEditForm.isDisabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Permanent Delete Group */}
                <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-500/[0.01] border border-rose-500/10 hover:border-rose-500/20 transition-all space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center text-sm shrink-0 mt-0.5">
                      <i className="fi fi-rr-trash"></i>
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-grow pr-2">
                      <p className="font-bold text-xs text-rose-600 dark:text-rose-400 font-jakarta">
                        Xóa nhóm vĩnh viễn
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed pr-2">
                        Xóa vĩnh viễn cộng đồng học tập này cùng với tất cả dữ liệu liên quan bao gồm bài đăng thảo luận, tài liệu đã chia sẻ và danh sách thành viên. Hành động này không thể khôi phục!
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsConfirmDeleteOpen(true)}
                      className="py-2.5 px-6 bg-rose-600 hover:bg-rose-700 active:scale-95 text-[#ffffff] rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-md shadow-rose-500/25 cursor-pointer"
                    >
                      Xóa nhóm vĩnh viễn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button & Status Message */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <div>
            {settingsMessage && (
              <p
                className={`text-xs font-bold font-jakarta ${
                  settingsMessage.includes("thành công")
                    ? "text-emerald-500"
                    : "text-rose-500"
                }`}
              >
                {settingsMessage}
              </p>
            )}
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/25 shrink-0"
          >
            {isSavingSettings ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang lưu...
              </>
            ) : (
              "Lưu cài đặt"
            )}
          </button>
        </div>
      </div>
      
      <GroupConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteGroup}
        title="XÓA NHÓM VĨNH VIỄN"
        message="CẢNH BÁO CỰC KỲ QUAN TRỌNG: Bạn có chắc chắn muốn XÓA VĨNH VIỄN nhóm này không? Mọi dữ liệu bài viết, tài liệu và thành viên sẽ bị xóa hoàn toàn và KHÔNG THỂ HOÀN TÁC."
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

const Toggle = ({ enabled, onChange, label, description, icon }) => {
  return (
    <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 shadow-sm hover:border-slate-200 dark:hover:border-white/10 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center text-sm shrink-0 mt-0.5 transition-all">
          <i className={`fi ${icon}`}></i>
        </div>
        <div className="space-y-0.5 min-w-0 pr-2 font-inter">
          <p className="font-bold text-xs text-slate-800 dark:text-white font-jakarta truncate">
            {label}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed pr-2">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 shrink-0 mt-1 ${
          enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-zinc-700"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
            enabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};
