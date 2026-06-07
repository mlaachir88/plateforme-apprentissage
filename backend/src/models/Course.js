import mongoose from "mongoose";

const coursePartSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const courseSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    niveau: {
      type: String,
      required: true,
      trim: true,
    },

    matiere: {
      type: String,
      required: true,
      trim: true,
    },

    contenuTexte: {
      type: String,
      default: "",
    },

    pdfUrl: {
      type: String,
      default: "",
    },

    parties: {
      type: [coursePartSchema],
      default: [],
    },

    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    etudiantsAutorises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;