import User from "../models/User.js";

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
      .select("-motDePasse")
      .sort({ niveauScolaire: 1, classe: 1, nom: 1 });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des étudiants",
    });
  }
};