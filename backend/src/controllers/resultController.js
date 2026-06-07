import Result from "../models/Result.js";
import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import { generateTeacherAnalysis } from "../services/aiTeacherAnalysisService.js";

export const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate("quiz", "titre difficulte type")
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
      .populate("quiz", "titre difficulte type")
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

const getStatutFromScore = (score) => {
  if (score >= 70) {
    return "maitrise";
  }

  if (score >= 50) {
    return "a_renforcer";
  }

  return "fragile";
};

const getPriorityFromScore = (score) => {
  if (score < 40) {
    return "prioritaire";
  }

  if (score < 70) {
    return "a_revoir";
  }

  return "satisfaisant";
};

export const getTeacherCourseAnalysis = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      creePar: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        message: "Cours introuvable ou non autorisé",
      });
    }

    const results = await Result.find({
      course: courseId,
    })
      .populate("student", "prenom nom email niveauScolaire classe")
      .populate("quiz", "titre type")
      .sort({ createdAt: -1 });

    if (results.length === 0) {
      return res.status(200).json({
        message: "Aucun résultat disponible pour analyser ce cours",
        source: "none",
        course: {
          _id: course._id,
          titre: course.titre,
          matiere: course.matiere,
          niveau: course.niveau,
        },
        stats: {
          studentsCount: course.etudiantsAutorises?.length || 0,
          resultsCount: 0,
          averageScore: 0,
        },
        partiesAnalysis: [],
        competencesFaibles: [],
        studentsToSupport: [],
        ai: null,
      });
    }

    const latestResultByStudent = new Map();

    results.forEach((result) => {
      const studentId = result.student?._id?.toString();

      if (!studentId) {
        return;
      }

      if (!latestResultByStudent.has(studentId)) {
        latestResultByStudent.set(studentId, result);
      }
    });

    const latestResults = Array.from(latestResultByStudent.values());

    const averageScore =
      latestResults.length > 0
        ? Math.round(
            latestResults.reduce((sum, result) => sum + result.score, 0) /
              latestResults.length
          )
        : 0;

    const partiesMap = new Map();
    const competencesMap = new Map();

    latestResults.forEach((result) => {
      const analyseParPartie = result.diagnostic?.analyseParPartie || [];

      analyseParPartie.forEach((partie) => {
        if (!partie.partieId) {
          return;
        }

        const current = partiesMap.get(partie.partieId) || {
          partieId: partie.partieId,
          titre: partie.titre,
          totalScores: 0,
          count: 0,
          totalQuestions: 0,
          bonnesReponses: 0,
        };

        current.totalScores += partie.score;
        current.count += 1;
        current.totalQuestions += partie.totalQuestions || 0;
        current.bonnesReponses += partie.bonnesReponses || 0;

        partiesMap.set(partie.partieId, current);
      });

      const competencesFaibles = result.diagnostic?.competencesFaibles || [];

      competencesFaibles.forEach((item) => {
        const competence = item.competence || "autre";
        const current = competencesMap.get(competence) || {
          competence,
          erreurs: 0,
        };

        current.erreurs += item.erreurs || 0;

        competencesMap.set(competence, current);
      });
    });

    const partiesAnalysis = Array.from(partiesMap.values())
      .map((partie) => {
        const scoreMoyen =
          partie.count > 0 ? Math.round(partie.totalScores / partie.count) : 0;

        return {
          partieId: partie.partieId,
          titre: partie.titre,
          scoreMoyen,
          statut: getStatutFromScore(scoreMoyen),
          priorite: getPriorityFromScore(scoreMoyen),
          totalQuestions: partie.totalQuestions,
          bonnesReponses: partie.bonnesReponses,
          studentsCount: partie.count,
        };
      })
      .sort((a, b) => a.scoreMoyen - b.scoreMoyen);

    const competencesFaibles = Array.from(competencesMap.values()).sort(
      (a, b) => b.erreurs - a.erreurs
    );

    const studentsToSupport = latestResults
      .filter((result) => result.score < 60 || result.niveauDetecte === "weak")
      .map((result) => ({
        studentId: result.student?._id,
        prenom: result.student?.prenom || "",
        nom: result.student?.nom || "",
        email: result.student?.email || "",
        niveauScolaire: result.student?.niveauScolaire || "",
        classe: result.student?.classe || "",
        score: result.score,
        niveauDetecte: result.niveauDetecte,
        partieFaible: result.diagnostic?.partieFaible || "",
        createdAt: result.createdAt,
      }))
      .sort((a, b) => a.score - b.score);

    const stats = {
      studentsCount: course.etudiantsAutorises?.length || latestResults.length,
      studentsWithResults: latestResults.length,
      resultsCount: results.length,
      latestResultsCount: latestResults.length,
      averageScore,
    };

    const ai = await generateTeacherAnalysis({
      course: {
        _id: course._id,
        titre: course.titre,
        matiere: course.matiere,
        niveau: course.niveau,
      },
      stats,
      partiesAnalysis,
      competencesFaibles,
      studentsToSupport,
    });

    return res.status(200).json({
      message: "Analyse professeur générée avec succès",
      source: ai.source,
      errorCode: ai.errorCode || "",
      course: {
        _id: course._id,
        titre: course.titre,
        matiere: course.matiere,
        niveau: course.niveau,
      },
      stats,
      partiesAnalysis,
      competencesFaibles,
      studentsToSupport,
      ai: {
        source: ai.source,
        errorCode: ai.errorCode || "",
        synthese: ai.synthese,
        planAction: ai.planAction,
        groupes: ai.groupes,
        resumeClasse: ai.resumeClasse,
      },
    });
  } catch (error) {
    console.error("Erreur getTeacherCourseAnalysis :", error.message);

    res.status(500).json({
      message: "Erreur lors de la génération de l’analyse professeur",
      error: error.message,
    });
  }
};