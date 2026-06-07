import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Eye,
  FileQuestion,
  ListChecks,
  PlusCircle,
  Target,
} from "lucide-react";

import api from "../api/axios";
import TeacherNav from "../components/TeacherNav";

type CoursePart = {
  _id: string;
  titre: string;
  description: string;
};

type Course = {
  _id: string;
  titre: string;
  matiere: string;
  niveau: string;
  parties?: CoursePart[];
};

type Quiz = {
  _id: string;
  titre: string;
  description: string;
  type: "diagnostic" | "practice";
  partieId?: string;
  course: string | Course;
  questions: {
    _id: string;
    question: string;
    choix: string[];
    partieId?: string;
    competence?: string;
  }[];
  createdAt: string;
};

const quizTypeLabel = {
  diagnostic: "Diagnostic général",
  practice: "Exercice d’entraînement",
};

const quizTypeStyle = {
  diagnostic: "bg-blue-50 text-blue-700 border-blue-200",
  practice: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function TeacherQuizzesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const coursesResponse = await api.get("/courses");
        const teacherCourses: Course[] = coursesResponse.data;

        setCourses(teacherCourses);

        const quizzesByCourse = await Promise.all(
          teacherCourses.map(async (course) => {
            const response = await api.get(`/quizzes/course/${course._id}`);

            return response.data.map((quiz: Quiz) => ({
              ...quiz,
              course,
            }));
          })
        );

        setQuizzes(quizzesByCourse.flat());
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement des quiz"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchQuizzes();
  }, []);

  const getPartTitle = (quiz: Quiz, course: Course | null) => {
    if (!course || !quiz.partieId) {
      return "";
    }

    const part = course.parties?.find(
      (coursePart) => coursePart._id === quiz.partieId
    );

    return part?.titre || "";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                <FileQuestion size={16} />
                Gestion des quiz
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Mes quiz
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Retrouvez vos quiz diagnostiques et vos exercices d’entraînement
                associés aux parties de vos cours.
              </p>
            </div>

            <button
              onClick={() => navigate("/professeur/quiz/nouveau")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <PlusCircle size={18} />
              Créer un quiz
            </button>
          </div>
        </section>

        {chargement && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
            Chargement des quiz...
          </div>
        )}

        {erreur && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {erreur}
          </div>
        )}

        {!chargement && !erreur && courses.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BookOpen size={32} />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              Aucun cours créé
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Créez d’abord un cours avant d’ajouter un quiz.
            </p>

            <button
              onClick={() => navigate("/professeur/cours/nouveau")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <PlusCircle size={18} />
              Créer un cours
            </button>
          </div>
        )}

        {!chargement &&
          !erreur &&
          courses.length > 0 &&
          quizzes.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FileQuestion size={32} />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Aucun quiz créé
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Créez un quiz diagnostique pour analyser les résultats par
                partie, ou un exercice d’entraînement pour les recommandations.
              </p>

              <button
                onClick={() => navigate("/professeur/quiz/nouveau")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <PlusCircle size={18} />
                Créer un quiz
              </button>
            </div>
          )}

        {!chargement && !erreur && quizzes.length > 0 && (
          <div className="space-y-4">
            {quizzes.map((quiz) => {
              const course =
                typeof quiz.course === "string" ? null : quiz.course;

              const partTitle = getPartTitle(quiz, course);

              return (
                <article
                  key={quiz._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <FileQuestion size={28} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                              quizTypeStyle[quiz.type || "diagnostic"]
                            }`}
                          >
                            <Target size={13} />
                            {quizTypeLabel[quiz.type || "diagnostic"]}
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            <ListChecks size={13} />
                            {quiz.questions.length} question(s)
                          </span>

                          {partTitle && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                              Partie : {partTitle}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-lg font-bold text-slate-900">
                          {quiz.titre}
                        </h3>

                        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                          {quiz.description || "Quiz pédagogique"}
                        </p>

                        {course && (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                            <BookOpen size={16} />
                            {course.titre} · {course.matiere} · {course.niveau}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/professeur/quiz/${quiz._id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <Eye size={17} />
                      Voir le quiz
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default TeacherQuizzesPage;