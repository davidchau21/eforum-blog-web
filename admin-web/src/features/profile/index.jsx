import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Camera, 
  Edit3, 
  CheckCircle2, 
  Hash,
  ArrowLeft
} from "lucide-react";
import { Button, Tag, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const ProfilePage = () => {
  const { profile } = useSelector((state) => state.global);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  if (!profile) return null;

  const { personal_info, joinedAt, verified } = profile;

  return (
    <div className="p-8 max-w-5xl mx-auto font-exo-2">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8 flex items-center gap-4"
      >
        <Button 
          icon={<ArrowLeft size={18} />} 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-xl border-slate-200 hover:text-emerald-500 hover:border-emerald-500 transition-all h-10 w-10"
        />
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Hồ sơ cá nhân</h1>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Profile Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500 to-teal-400 opacity-10" />
          
          <div className="relative mt-8 group">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-10">
              {personal_info.profile_img ? (
                <img src={personal_info.profile_img} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <User size={64} />
                </div>
              )}
            </div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-white rounded-xl shadow-lg border-2 border-white z-20 hover:bg-emerald-600 transition-colors"
            >
              <Camera size={16} />
            </motion.button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-slate-800 capitalize">{personal_info.fullname}</h2>
              {verified && <CheckCircle2 size={18} className="text-emerald-500" />}
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-4">@{personal_info.username}</p>
            
            <Tag color="emerald" className="px-4 py-1 rounded-full font-black uppercase text-[10px] tracking-widest border-none shadow-sm shadow-emerald-500/20">
              {personal_info.role || 'ADMIN'}
            </Tag>
          </div>

          <Divider className="my-8 opacity-50" />

          <div className="w-full space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Trạng thái</span>
              <span className="text-xs font-black text-emerald-600 uppercase">Hoạt động</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Bảo mật</span>
              <span className="text-xs font-black text-blue-600 uppercase flex items-center gap-1">
                <Shield size={12} /> Cao
              </span>
            </div>
          </div>
        </motion.div>

        {/* Detailed Info */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                  <User size={20} />
                </div>
                Thông tin cơ bản
              </h3>
              <Button 
                type="text" 
                icon={<Edit3 size={18} />} 
                className="text-emerald-600 font-bold hover:bg-emerald-50 rounded-xl"
              >
                Chỉnh sửa
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Họ và tên</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                  <User size={18} className="text-slate-300" />
                  <span className="text-sm font-bold text-slate-700 capitalize">{personal_info.fullname}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                  <Mail size={18} className="text-slate-300" />
                  <span className="text-sm font-bold text-slate-700">{personal_info.email}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tên đăng nhập</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                  <Hash size={18} className="text-slate-300" />
                  <span className="text-sm font-bold text-slate-700">@{personal_info.username}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ngày tham gia</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                  <Calendar size={18} className="text-slate-300" />
                  <span className="text-sm font-bold text-slate-700">{dayjs(joinedAt).format('DD/MM/YYYY')}</span>
                </div>
              </div>
            </div>
            
            {personal_info.bio && (
              <div className="mt-8 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tiểu sử</label>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                  <p className="text-sm text-slate-600 leading-relaxed italic">"{personal_info.bio}"</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white flex items-center justify-between relative overflow-hidden group shadow-xl shadow-emerald-600/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h4 className="text-lg font-black mb-1">Cần hỗ trợ?</h4>
              <p className="text-emerald-50/70 text-xs font-medium">Nếu bạn gặp vấn đề về bảo mật hoặc truy cập, hãy liên hệ đội ngũ kỹ thuật.</p>
            </div>
            <Button className="relative z-10 bg-white text-emerald-600 border-none rounded-xl font-black px-6 hover:!text-emerald-700 hover:scale-105 transition-all">
              Hỗ trợ
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
