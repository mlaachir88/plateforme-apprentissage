import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    choix: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length >= 2;
        },
        message: "Une question doit contenir au moins deux choix",
      },
    },

    bonneReponse: {
      type: String,
      required: true,
      trim: true,
    },

    partieId: {
      type: String,
      default: "",
    },

    competence: {
      type: String,
      enum: [
        "comprehension",
        "calcul",
        "resolution_equation",
        "application_regle",
        "raisonnement",
        "autre",
      ],
      default: "autre",
    },
  },
  {
    _id: true,
  }
);

const quizSchema = new mongoose.Schema(
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

    type: {
      type: String,
      enum: ["diagnostic", "practice"],
      default: "diagnostic",
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    partieId: {
      type: String,
      default: "",
    },

    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "Un quiz doit contenir au moins une question",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;