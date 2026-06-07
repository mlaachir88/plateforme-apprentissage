import express from "express";

import { getStudents } from "../controllers/studentController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("teacher"),
  getStudents
);

export default router;