import Result from "../models/Result.js";
import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";

export const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate("quiz", "titre difficulte")
      .populate("course", "titre matiere niveau")
      .sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de vos résultats",
      error: error.message,
    });
  }
};

export const getTeacherResults = async (req, res) => {
  try {
    const teacherCourses = await Course.find({
      creePar: req.user._id,
    }).select("_id");

    const courseIds = teacherCourses.map((course) => course._id);

    const results = await Result.find({
      course: { $in: courseIds },
    })
      .populate("student", "prenom nom email niveauScolaire classe")
      .populate("quiz", "titre difficulte")
      .populate("course", "titre matiere niveau")
      .sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des résultats",
      error: error.message,
    });
  }
};

export const getMyRecommendations = async (req, res) => {
  try {
    const lastResult = await Result.findOne({
      student: req.user._id,
    })
      .populate("course")
      .populate("quiz")
      .sort({ createdAt: -1 });

    if (!lastResult) {
      return res.status(200).json({
        message: "Aucun résultat trouvé pour générer des recommandations",
        niveauDetecte: null,
        diagnostic: null,
        recommendations: [],
      });
    }

    const analyseParPartie = lastResult.diagnostic?.analyseParPartie || [];

    const partiesPrioritaires = analyseParPartie
      .filter(
        (partie) =>
          partie.statut === "fragile" || partie.statut === "a_renforcer"
      )
      .sort((a, b) => a.score - b.score);

    const partieIds = partiesPrioritaires
      .map((partie) => partie.partieId)
      .filter((partieId) => partieId && partieId !== "sans_partie");

    const recommendations = await Quiz.find({
      course: lastResult.course._id,
      type: "practice",
      partieId: {
        $in: partieIds,
      },
    }).select("-questions.bonneReponse");

    return res.status(200).json({
      message: "Recommandations générées avec succès",
      niveauDetecte: lastResult.niveauDetecte,
      diagnostic: lastResult.diagnostic,
      course: lastResult.course,
      lastResult: {
        score: lastResult.score,
        bonnesReponses: lastResult.bonnesReponses,
        totalQuestions: lastResult.totalQuestions,
        createdAt: lastResult.createdAt,
      },
      recommendations,
    });
  } catch (error) {
    console.error("Erreur getMyRecommendations :", error.message);

    res.status(500).json({
      message: "Erreur lors de la génération des recommandations",
      error: error.message,
    });
  }
};