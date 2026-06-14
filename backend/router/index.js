import express from "express";

// Import user routers
import authRouter from "./authRouter.js";
import messageRouter from "./messageRouter.js";
import userRouter from "./userRouter.js";
import fileRouter from "./fileRouter.js";
import tagRouter from "./tagRouter.js";
import blogRouter from "./blogRouter.js";
import commentRouter from "./commentRouter.js";
import searchRouter from "./searchRouter.js";
import alertRouter from "./alertRouter.js";
import notificationRouter from "./notificationRouter.js";
import chatRouter from "./chatRouter.js";
import documentRouter from "./documentRouter.js";

// Import admin routers
import adminAlertRouter from "./admin/adminAlertRouter.js";
import adminBlogRouter from "./admin/adminBlogRouter.js";
import adminCommentRouter from "./admin/adminCommentRouter.js";
import adminReportRouter from "./admin/adminReportRouter.js";
import adminTagRouter from "./admin/adminTagRouter.js";
import adminUserRouter from "./admin/adminUserRouter.js";
import adminRoleRouter from "./admin/adminRoleRouter.js";
import adminActivityLogRouter from "./admin/adminActivityLogRouter.js";

const appRouter = express.Router();

// User routes
appRouter.use("/message", messageRouter);
appRouter.use("/notifications", notificationRouter);
appRouter.use("/users", userRouter);
appRouter.use("/tags", tagRouter);
appRouter.use("/files", fileRouter);
appRouter.use("/blogs", blogRouter);
appRouter.use("/alert", alertRouter);
appRouter.use("/comments", commentRouter);
appRouter.use("/search", searchRouter);
appRouter.use("/chat", chatRouter);
appRouter.use("/documents", documentRouter);
appRouter.use("/", authRouter);

// Admin routes (mounted at /admin)
appRouter.use("/users", adminUserRouter);
appRouter.use("/tags", adminTagRouter);
appRouter.use("/blogs", adminBlogRouter);
appRouter.use("/alert", adminAlertRouter);
appRouter.use("/comments", adminCommentRouter);
appRouter.use("/reports", adminReportRouter);
appRouter.use("/roles", adminRoleRouter);
appRouter.use("/logs", adminActivityLogRouter);

export default appRouter;
