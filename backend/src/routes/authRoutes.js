import express from "express";

import {
  deleteProfileAvatar,
  getMe,
  login,
  register,
  updateProfile,
  updateProfileAvatar,
} from "../controllers/authController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { uploadAvatar } from "../middleware/uploadAvatar.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getMe);

router.patch("/profile", protect, updateProfile);
router.patch("/profile/avatar", protect, uploadAvatar, updateProfileAvatar);
router.delete("/profile/avatar", protect, deleteProfileAvatar);

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