import express from "express";

import {
  login,
  register,
  getMe,
} from "../controllers/authController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getMe);

router.get(
  "/teacher-test",
  protect,
  authorizeRoles("teacher"),
  (req, res) => {
    res.json({
      message: "Accès professeur autorisé",
    });
  }
);

export default router;