import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(null, false);
    }

    callback(null, true);
  },
});

export const uploadAvatar = (req, res, next) => {
  upload.single("avatar")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "L’image est trop volumineuse. Taille maximale : 2 Mo.",
        });
      }

      return res.status(400).json({
        message: "Erreur lors de l’envoi de l’image",
      });
    }

    if (error) {
      return res.status(400).json({
        message: "Erreur lors de l’envoi de l’image",
      });
    }

    next();
  });
};