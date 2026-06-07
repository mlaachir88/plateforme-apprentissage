import mongoose from "mongoose";

const analyseParPartieSchema = new mongoose.Schema(
  {
    partieId: {
      type: String,
      default: "",
    },

    titre: {
      type: String,
      default: "",
      trim: true,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    bonnesReponses: {
      type: Number,
      default: 0,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    statut: {
      type: String,
      enum: ["maitrise", "a_renforcer", "fragile"],
      default: "fragile",
    },
  },
  {
    _id: false,
  }
);

const competenceFaibleSchema = new mongoose.Schema(
  {
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

    erreurs: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    niveauDetecte: {
      type: String,
      enum: ["weak", "medium", "strong"],
      required: true,
    },

    bonnesReponses: {
      type: Number,
      required: true,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      required: true,
      default: 0,
    },

    answers: {
      type: [String],
      default: [],
    },

    tentative: {
      type: Number,
      default: 1,
    },

    diagnostic: {
      partieFaible: {
        type: String,
        default: "",
        trim: true,
      },

      analyseParPartie: {
        type: [analyseParPartieSchema],
        default: [],
      },

      competencesFaibles: {
        type: [competenceFaibleSchema],
        default: [],
      },

      commentaire: {
        type: String,
        default: "",
        trim: true,
      },

      recommandation: {
        type: String,
        default: "",
        trim: true,
      },

      ai: {
        synthese: {
          type: String,
          default: "",
          trim: true,
        },

        competences: {
          type: String,
          default: "",
          trim: true,
        },

        source: {
          type: String,
          enum: ["openai", "fallback"],
          default: "fallback",
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model("Result", resultSchema);

export default Result;