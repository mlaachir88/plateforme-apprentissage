import express from "express";

import {
  createQuiz,
  getQuizByCourse,
  submitQuiz,
} from "../controllers/quizController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("teacher"),
  createQuiz
);

router.get(
  "/course/:courseId",
  protect,
  getQuizByCourse
);

router.post(
  "/:quizId/submit",
  protect,
  authorizeRoles("student"),
  submitQuiz
);

export default router;