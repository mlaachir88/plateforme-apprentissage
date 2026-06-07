import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import Result from "../models/Result.js";

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const courses = await Course.find({
      creePar: teacherId,
    });

    const courseIds = courses.map((course) => course._id);

    const coursesCount = courses.length;

    const quizzesCount = await Quiz.countDocuments({
      creePar: teacherId,
    });

    const results = await Result.find({
      course: { $in: courseIds },
    })
      .populate("student", "prenom nom email niveauScolaire classe")
      .populate("quiz", "titre difficulte")
      .populate("course", "titre matiere niveau")
      .sort({ updatedAt: -1 });

    const resultsCount = results.length;

    const studentsIds = new Set();

    courses.forEach((course) => {
      course.etudiantsAutorises.forEach((studentId) => {
        studentsIds.add(studentId.toString());
      });
    });

    const studentsCount = studentsIds.size;

    const averageScore =
      resultsCount > 0
        ? Math.round(
            results.reduce((sum, result) => sum + result.score, 0) /
              resultsCount
          )
        : 0;

    const latestResults = results.slice(0, 5);

    res.status(200).json({
      coursesCount,
      quizzesCount,
      studentsCount,
      resultsCount,
      averageScore,
      latestResults,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du tableau de bord professeur",
      error: error.message,
    });
  }
};