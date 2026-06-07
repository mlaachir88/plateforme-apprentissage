import express from "express";

import {
  createCourse,
  getCourses,
  giveAccessToCourse,
} from "../controllers/courseController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCourses);

router.post(
  "/",
  protect,
  authorizeRoles("teacher"),
  createCourse
);

router.post(
  "/:courseId/access",
  protect,
  authorizeRoles("teacher"),
  giveAccessToCourse
);

export default router;