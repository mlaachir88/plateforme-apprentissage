import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    prenom: {
      type: String,
      required: true,
      trim: true,
    },

    nom: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    motDePasse: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["teacher", "student"],
      default: "student",
    },

    niveauScolaire: {
      type: String,
      enum: ["1ere_college", "2eme_college", "3eme_college"],
      required: function () {
        return this.role === "student";
      },
    },

    classe: {
      type: String,
      enum: ["classe_1", "classe_2", "classe_3"],
      required: function () {
        return this.role === "student";
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;