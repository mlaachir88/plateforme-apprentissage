import User from "../models/User.js";

const STUDENT_PUBLIC_FIELDS =
  "prenom nom email niveauScolaire classe role profile";

export const getStudents = async (req, res) => {
  try {
    const { niveauScolaire, classe } = req.query;

    const filtre = {
      role: "student",
    };

    if (niveauScolaire) {
      filtre.niveauScolaire = niveauScolaire;
    }

    if (classe) {
      filtre.classe = classe;
    }

    const students = await User.find(filtre)
      .select(STUDENT_PUBLIC_FIELDS)
      .sort({ niveauScolaire: 1, classe: 1, nom: 1 });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des étudiants",
      error: error.message,
    });
  }
};