import Course from "../models/Course.js";

const USER_PUBLIC_FIELDS = "prenom nom email role profile";
const STUDENT_PUBLIC_FIELDS = "prenom nom email niveauScolaire classe profile";

export const createCourse = async (req, res) => {
  try {
    const {
      titre,
      description,
      niveau,
      matiere,
      contenuTexte,
      pdfUrl,
      parties,
    } = req.body;

    if (!titre || !description || !niveau || !matiere) {
      return res.status(400).json({
        message:
          "Les champs titre, description, niveau et matière sont obligatoires",
      });
    }

    if (!contenuTexte && !pdfUrl) {
      return res.status(400).json({
        message: "Le cours doit contenir un texte ou un PDF",
      });
    }

    let partiesNettoyees = [];

    if (Array.isArray(parties)) {
      partiesNettoyees = parties
        .filter((partie) => partie.titre && partie.titre.trim() !== "")
        .map((partie) => ({
          titre: partie.titre.trim(),
          description: partie.description?.trim() || "",
        }));
    }

    const course = await Course.create({
      titre,
      description,
      niveau,
      matiere,
      contenuTexte,
      pdfUrl,
      parties: partiesNettoyees,
      creePar: req.user._id,
      etudiantsAutorises: [],
    });

    const populatedCourse = await Course.findById(course._id)
      .populate("creePar", USER_PUBLIC_FIELDS)
      .populate("etudiantsAutorises", STUDENT_PUBLIC_FIELDS);

    res.status(201).json({
      message: "Cours créé avec succès",
      course: populatedCourse,
    });
  } catch (error) {
    console.error("Erreur createCourse :", error.message);

    res.status(500).json({
      message: "Erreur lors de la création du cours",
      error: error.message,
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    const filtre = {};

    if (req.user.role === "teacher") {
      filtre.creePar = req.user._id;
    }

    if (req.user.role === "student") {
      filtre.etudiantsAutorises = req.user._id;
    }

    const courses = await Course.find(filtre)
      .populate("creePar", USER_PUBLIC_FIELDS)
      .populate("etudiantsAutorises", STUDENT_PUBLIC_FIELDS)
      .sort({ createdAt: -1 });

    res.status(200).json(courses);
  } catch (error) {
    console.error("Erreur getCourses :", error.message);

    res.status(500).json({
      message: "Erreur lors de la récupération des cours",
      error: error.message,
    });
  }
};

export const giveAccessToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        message: "Veuillez fournir une liste d'étudiants",
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      creePar: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        message: "Cours introuvable ou non autorisé",
      });
    }

    const idsExistants = course.etudiantsAutorises.map((id) => id.toString());

    const nouveauxIds = studentIds.filter(
      (id) => !idsExistants.includes(id)
    );

    course.etudiantsAutorises.push(...nouveauxIds);

    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate("creePar", USER_PUBLIC_FIELDS)
      .populate("etudiantsAutorises", STUDENT_PUBLIC_FIELDS);

    res.status(200).json({
      message: "Accès au cours accordé avec succès",
      course: populatedCourse,
    });
  } catch (error) {
    console.error("Erreur giveAccessToCourse :", error.message);

    res.status(500).json({
      message: "Erreur lors de l'attribution de l'accès au cours",
      error: error.message,
    });
  }
};