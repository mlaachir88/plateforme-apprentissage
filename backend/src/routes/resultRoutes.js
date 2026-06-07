import express from "express";

import {
  getMyResults,
  getTeacherResults,
  getMyRecommendations,
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

export default router;