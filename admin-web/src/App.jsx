import MainLayout from "@/components/layout/main-layout";
import CategoryManagement from "@/features/category";
import Dashboard from "@/features/dashboard";
import Login from "@/features/login";

import StaffManagement from "@/features/staff";
import CreateStaff from "@/features/staff/pages/create-staff";
import EditStaff from "@/features/staff/pages/edit-staff";
import { Route, Routes } from "react-router-dom";
import BlogManagement from "./features/blogs";
import CreateBlog from "./features/blogs/pages/createBlog";
import EditBlog from "./features/blogs/pages/editBlog";
import CommentManagement from "./features/comment";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route path="/tags" element={<CategoryManagement />} />
        <Route path="/users/create" element={<CreateStaff />} />
        <Route path="/users/:id" element={<EditStaff />} />
        <Route path="/users" element={<StaffManagement />} />
        <Route path="/blogs" element={<BlogManagement />} />
        <Route path="/comments" element={<CommentManagement />} />
        <Route path="/blogs/create" element={<CreateBlog />} />
        <Route path="/blogs/:id" element={<EditBlog />} />
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default App;
