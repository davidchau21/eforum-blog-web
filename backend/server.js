import express from "express";
import "dotenv/config";
import cors from "cors";
import { server, app } from "./socket/socket.js";
import { PORT, corsOptions } from "./config/app.js";
import { connectDatabase } from "./config/database.js";
import "./config/firebase.js";

// Import central router
import appRouter from "./router/index.js";

server.use(express.json());
server.use(cors(corsOptions));

connectDatabase();

// Use central router for all endpoints
server.use("/", appRouter);

app.listen(PORT, () => {
  console.log("listening on port -> " + PORT);
});
