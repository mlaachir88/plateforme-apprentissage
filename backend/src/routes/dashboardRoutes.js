import express from "express";

import { getTeacherDashboard } from "../controllers/dashboardController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/teacher",
  protect,
  authorizeRoles("teacher"),
  getTeacherDashboard
);

export default router;