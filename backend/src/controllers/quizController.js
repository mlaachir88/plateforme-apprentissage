import mongoose from "mongoose";

import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import Result from "../models/Result.js";
import { generateAiDiagnostic } from "../services/aiDiagnosticService.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createQuiz = async (req, res) => {
  try {
    const { titre, description, type, course, partieId, questions } = req.body;

    if (!titre || !course || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "Titre, cours et questions sont obligatoires",
      });
    }

    if (!isValidObjectId(course)) {
      return res.status(400).json({
        message: "Identifiant du cours invalide",
      });
    }

    const courseExists = await Course.findOne({
      _id: course,
      creePar: req.user._id,
    });

    if (!courseExists) {
      return res.status(404).json({
        message: "Cours introuvable ou non autorisé",
      });
    }

    const quizType = type || "diagnostic";

    if (!["diagnostic", "practice"].includes(quizType)) {
      return res.status(400).json({
        message: "Type de quiz invalide",
      });
    }

    const questionsNettoyees = questions.map((question) => ({
      question: question.question,
      choix: question.choix,
      bonneReponse: question.bonneReponse,
      partieId: question.partieId || "",
      competence: question.competence || "autre",
    }));

    const quiz = await Quiz.create({
      titre,
      description,
      type: quizType,
      course,
      partieId: quizType === "practice" ? partieId || "" : "",
      questions: questionsNettoyees,
      creePar: req.user._id,
    });

    res.status(201).json({
      message: "Quiz créé avec succès",
      quiz,
    });
  } catch (error) {
    console.error("Erreur createQuiz :", error.message);

    res.status(500).json({
      message: "Erreur lors de la création du quiz",
      error: error.message,
    });
  }
};

export const getQuizByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        message: "Identifiant du cours invalide",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Cours introuvable",
      });
    }

    if (req.user.role === "teacher") {
      const isOwner = course.creePar.toString() === req.user._id.toString();

      if (!isOwner) {
        return res.status(403).json({
          message: "Accès refusé à ce cours",
        });
      }

      const quizzes = await Quiz.find({
        course: courseId,
      }).sort({ createdAt: -1 });

      return res.status(200).json(quizzes);
    }

    if (req.user.role === "student") {
      const isAuthorized = course.etudiantsAutorises.some(
        (studentId) => studentId.toString() === req.user._id.toString()
      );

      if (!isAuthorized) {
        return res.status(403).json({
          message: "Accès refusé à ce cours",
        });
      }

      const quizzes = await Quiz.find({
        course: courseId,
      })
        .select("-questions.bonneReponse")
        .sort({ createdAt: -1 });

      return res.status(200).json(quizzes);
    }

    return res.status(403).json({
      message: "Rôle non autorisé",
    });
  } catch (error) {
    console.error("Erreur getQuizByCourse :", error.message);

    res.status(500).json({
      message: "Erreur lors de la récupération des quiz",
      error: error.message,
    });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    if (!isValidObjectId(quizId)) {
      return res.status(400).json({
        message: "Identifiant du quiz invalide",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: "Les réponses doivent être envoyées sous forme de tableau",
      });
    }

    const quiz = await Quiz.findById(quizId).populate("course");

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz introuvable",
      });
    }

    const course = quiz.course;

    if (!course) {
      return res.status(404).json({
        message: "Cours associé introuvable",
      });
    }

    const isAuthorized = course.etudiantsAutorises.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );

    if (!isAuthorized) {
      return res.status(403).json({
        message: "Accès refusé à ce quiz",
      });
    }

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        message: "Le nombre de réponses ne correspond pas au nombre de questions",
      });
    }

    let bonnesReponses = 0;

    const analyseParPartieMap = {};
    const erreursParCompetence = {};

    quiz.questions.forEach((question, index) => {
      const studentAnswer = answers[index];
      const isCorrect = studentAnswer === question.bonneReponse;

      if (isCorrect) {
        bonnesReponses += 1;
      }

      const partieId = question.partieId || "sans_partie";

      const partie = course.parties?.find(
        (coursePart) => coursePart._id.toString() === partieId
      );

      const titrePartie = partie?.titre || "Partie non définie";

      if (!analyseParPartieMap[partieId]) {
        analyseParPartieMap[partieId] = {
          partieId,
          titre: titrePartie,
          totalQuestions: 0,
          bonnesReponses: 0,
          score: 0,
          statut: "a_renforcer",
        };
      }

      analyseParPartieMap[partieId].totalQuestions += 1;

      if (isCorrect) {
        analyseParPartieMap[partieId].bonnesReponses += 1;
      }

      if (!isCorrect) {
        const competence = question.competence || "autre";

        if (!erreursParCompetence[competence]) {
          erreursParCompetence[competence] = 0;
        }

        erreursParCompetence[competence] += 1;
      }
    });

    const totalQuestions = quiz.questions.length;

    const score =
      totalQuestions > 0
        ? Math.round((bonnesReponses / totalQuestions) * 100)
        : 0;

    let niveauDetecte = "weak";

    if (score >= 75) {
      niveauDetecte = "strong";
    } else if (score >= 50) {
      niveauDetecte = "medium";
    }

    const analyseParPartie = Object.values(analyseParPartieMap).map(
      (partie) => {
        const scorePartie =
          partie.totalQuestions > 0
            ? Math.round((partie.bonnesReponses / partie.totalQuestions) * 100)
            : 0;

        let statut = "fragile";

        if (scorePartie >= 75) {
          statut = "maitrise";
        } else if (scorePartie >= 50) {
          statut = "a_renforcer";
        }

        return {
          ...partie,
          score: scorePartie,
          statut,
        };
      }
    );

    const partiesTriees = [...analyseParPartie].sort(
      (a, b) => a.score - b.score
    );

    const partieFaible = partiesTriees[0]?.titre || "";

    const competencesFaibles = Object.entries(erreursParCompetence)
      .map(([competence, erreurs]) => ({
        competence,
        erreurs,
      }))
      .sort((a, b) => b.erreurs - a.erreurs);

    let commentaire = "Le diagnostic a été calculé à partir des réponses.";

    const partiesMaitrisees = analyseParPartie.filter(
      (partie) => partie.statut === "maitrise"
    );

    if (quiz.type === "practice") {
      commentaire =
        "Cet exercice d’entraînement permet de renforcer une partie ciblée du cours.";
    } else if (partieFaible) {
      commentaire = `L’élève rencontre des difficultés dans la partie : ${partieFaible}.`;
    } else if (
      analyseParPartie.length > 0 &&
      partiesMaitrisees.length === analyseParPartie.length
    ) {
      commentaire =
        "L’élève maîtrise globalement les parties évaluées dans ce quiz.";
    } else {
      commentaire =
        "L’élève possède des acquis, mais certaines parties doivent encore être renforcées.";
    }

    const recommandation = partieFaible
      ? `Il est recommandé de refaire des exercices d’entraînement liés à la partie : ${partieFaible}.`
      : "Il est recommandé de refaire quelques exercices d’entraînement.";

    const aiDiagnostic = await generateAiDiagnostic({
      courseTitle: course.titre,
      quizTitle: quiz.titre,
      score,
      niveauDetecte,
      partieFaible,
      analyseParPartie,
      competencesFaibles,
    });

    const nombreTentatives = await Result.countDocuments({
      student: req.user._id,
      quiz: quiz._id,
    });

    const result = await Result.create({
      student: req.user._id,
      quiz: quiz._id,
      course: course._id,
      score,
      niveauDetecte,
      bonnesReponses,
      totalQuestions,
      answers,
      tentative: nombreTentatives + 1,
      diagnostic: {
        partieFaible,
        analyseParPartie,
        competencesFaibles,
        commentaire: aiDiagnostic.commentaire || commentaire,
        recommandation: aiDiagnostic.recommandation || recommandation,
        ai: {
          synthese: aiDiagnostic.synthese || "",
          competences: aiDiagnostic.competences || "",
          source: aiDiagnostic.source || "fallback",
        },
      },
    });

    res.status(201).json({
      message: "Quiz corrigé avec succès",
      score,
      niveau: niveauDetecte,
      niveauDetecte,
      bonnesReponses,
      totalQuestions,
      diagnostic: result.diagnostic,
      result,
    });
  } catch (error) {
    console.error("Erreur submitQuiz :", error.message);

    res.status(500).json({
      message: "Erreur lors de la soumission du quiz",
      error: error.message,
    });
  }
};