import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  FileQuestion,
  Layers,
  ListChecks,
  Target,
} from "lucide-react";

import api from "../api/axios";
import TeacherNav from "../components/TeacherNav";
import MathContent from "../components/MathContent";

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
    bonneReponse?: string;
    partieId?: string;
    competence?: string;
  }[];
};

const quizTypeLabel = {
  diagnostic: "Diagnostic général",
  practice: "Exercice d’entraînement",
};

const quizTypeStyle = {
  diagnostic: "bg-blue-50 text-blue-700 border-blue-200",
  practice: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const competenceLabel: Record<string, string> = {
  comprehension: "Compréhension de la consigne",
  calcul: "Calcul",
  resolution_equation: "Résolution d’équation",
  application_regle: "Application d’une règle",
  raisonnement: "Raisonnement mathématique",
  autre: "Autre",
};

function TeacherQuizDetailPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchQuizDetail = async () => {
      try {
        const coursesResponse = await api.get("/courses");
        const courses: Course[] = coursesResponse.data;

        for (const course of courses) {
          const quizzesResponse = await api.get(`/quizzes/course/${course._id}`);

          const foundQuiz = quizzesResponse.data.find(
            (item: Quiz) => item._id === quizId
          );

          if (foundQuiz) {
            setQuiz({
              ...foundQuiz,
              course,
            });
            return;
          }
        }

        setErreur("Quiz introuvable");
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement du quiz"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchQuizDetail();
  }, [quizId]);

  const course = quiz && typeof quiz.course !== "string" ? quiz.course : null;

  const getPartTitle = (partieId?: string) => {
    if (!course || !partieId) {
      return "Aucune partie";
    }

    const part = course.parties?.find((coursePart) => coursePart._id === partieId);

    return part?.titre || "Partie inconnue";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {chargement && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
            Chargement du quiz...
          </div>
        )}

        {erreur && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {erreur}

            <button
              onClick={() => navigate("/professeur/quiz")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <ArrowLeft size={17} />
              Retour aux quiz
            </button>
          </div>
        )}

        {!chargement && !erreur && quiz && (
          <>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-10 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.35),transparent_35%)]" />

                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div
                      className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${
                        quizTypeStyle[quiz.type || "diagnostic"]
                      }`}
                    >
                      {quizTypeLabel[quiz.type || "diagnostic"]}
                    </div>

                    <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
                      {quiz.titre}
                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
                      {quiz.description || "Quiz pédagogique"}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/professeur/quiz")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    <ArrowLeft size={17} />
                    Retour
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                    <FileQuestion size={18} />
                    Questions
                  </div>

                  <p className="mt-3 text-3xl font-bold text-blue-800">
                    {quiz.questions.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Target size={18} />
                    Type
                  </div>

                  <p className="mt-3 text-lg font-bold text-slate-900">
                    {quizTypeLabel[quiz.type || "diagnostic"]}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <BookOpen size={18} />
                    Cours associé
                  </div>

                  <p className="mt-3 text-lg font-bold text-slate-900">
                    {course?.titre || "Cours inconnu"}
                  </p>
                </div>
              </div>
            </section>

            {course && (
              <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <BookOpen size={24} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {course.titre}
                      </h2>

                      <p className="text-sm text-slate-500">
                        {course.matiere} · {course.niveau}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/professeur/cours/${course._id}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <Eye size={17} />
                    Voir le cours
                  </button>
                </div>
              </section>
            )}

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ListChecks size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Questions du quiz
                  </h2>

                  <p className="text-sm text-slate-500">
                    Chaque question est reliée à une partie du cours et à une compétence.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {quiz.questions.map((question, index) => {
                  const competence =
                    competenceLabel[question.competence || "autre"] || "Autre";

                  return (
                    <article
                      key={question._id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                    >
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                          <Target size={16} />
                          Question {index + 1}
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 size={14} />
                          Correction disponible
                        </div>
                      </div>

                      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                            <Layers size={15} />
                            Partie du cours
                          </div>

                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {getPartTitle(question.partieId)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                            <Target size={15} />
                            Compétence évaluée
                          </div>

                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {competence}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-5 text-slate-800 shadow-sm">
                        <MathContent content={question.question} />
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {question.choix.map((choix) => {
                          const isCorrect = choix === question.bonneReponse;

                          return (
                            <div
                              key={choix}
                              className={`rounded-2xl border p-4 transition ${
                                isCorrect
                                  ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <div
                                className={
                                  isCorrect
                                    ? "text-emerald-800"
                                    : "text-slate-700"
                                }
                              >
                                <MathContent content={choix} />
                              </div>

                              {isCorrect && (
                                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  <CheckCircle2 size={14} />
                                  Bonne réponse
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default TeacherQuizDetailPage;