import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API OK");
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/dashboard", dashboardRoutes);


export default app;