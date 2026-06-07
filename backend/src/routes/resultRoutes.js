import express from "express";

import {
  getMyResults,
  getTeacherResults,
  getMyRecommendations,
  getTeacherCourseAnalysis,
} from "../controllers/resultController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/me",
  protect,
  authorizeRoles("student"),
  getMyResults
);

router.get(
  "/teacher",
  protect,
  authorizeRoles("teacher"),
  getTeacherResults
);

router.get(
  "/recommendations/me",
  protect,
  authorizeRoles("student"),
  getMyRecommendations
);

router.get(
  "/course/:courseId/teacher-analysis",
  protect,
  authorizeRoles("teacher"),
  getTeacherCourseAnalysis
);

export default router;