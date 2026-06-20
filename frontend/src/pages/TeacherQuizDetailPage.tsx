import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
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
  diagnostic: "border-violet-100 bg-violet-50 text-violet-700",
  practice: "border-emerald-100 bg-emerald-50 text-emerald-700",
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

    const part = course.parties?.find(
      (coursePart) => coursePart._id === partieId
    );

    return part?.titre || "Partie inconnue";
  };

  const questionPartsCount = useMemo(() => {
    if (!quiz) {
      return 0;
    }

    const uniqueParts = new Set(
      quiz.questions
        .map((question) => question.partieId)
        .filter((partieId): partieId is string => Boolean(partieId))
    );

    return uniqueParts.size;
  }, [quiz]);

  const competencesCount = useMemo(() => {
    if (!quiz) {
      return 0;
    }

    const uniqueCompetences = new Set(
      quiz.questions.map((question) => question.competence || "autre")
    );

    return uniqueCompetences.size;
  }, [quiz]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbf8ff] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute right-[-220px] top-[260px] h-[460px] w-[460px] rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="absolute bottom-[-240px] left-[-160px] h-[500px] w-[500px] rounded-full bg-amber-100/35 blur-3xl" />
      </div>

      <TeacherNav />

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {chargement && (
          <section className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Clock3 size={23} />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Chargement du quiz...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous récupérons les informations du quiz.
                </p>
              </div>
            </div>
          </section>
        )}

        {erreur && (
          <section className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <p className="font-bold">Une erreur est survenue</p>
            <p className="mt-2 text-sm leading-6">{erreur}</p>

            <button
              onClick={() => navigate("/professeur/quiz")}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
            >
              <ArrowLeft size={17} />
              Retour aux quiz
            </button>
          </section>
        )}

        {!chargement && !erreur && quiz && (
          <>
            <section className="mb-6 rounded-[2.4rem] border border-violet-100 bg-white/90 p-6 shadow-xl shadow-violet-100/40 backdrop-blur-2xl md:p-8">
              <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                      quizTypeStyle[quiz.type || "diagnostic"]
                    }`}
                  >
                    <FileQuestion size={16} />
                    {quizTypeLabel[quiz.type || "diagnostic"]}
                  </div>

                  <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                    {quiz.titre}
                  </h1>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                    {quiz.description || "Quiz pédagogique"}
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate("/professeur/quiz")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                    >
                      <ArrowLeft size={17} />
                      Retour aux quiz
                    </button>

                    {course && (
                      <button
                        onClick={() =>
                          navigate(`/professeur/cours/${course._id}`)
                        }
                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                      >
                        <Eye size={17} />
                        Voir le cours
                        <ArrowRight
                          size={17}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-violet-700">
                          Questions
                        </p>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                          {quiz.questions.length}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm">
                        <ListChecks size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-emerald-700">
                          Parties
                        </p>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                          {questionPartsCount}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
                        <Layers size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-amber-700">
                          Compétences
                        </p>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                          {competencesCount}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
                        <Target size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {course && (
              <section className="mb-6 rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <BookOpen size={24} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-950">
                        {course.titre}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {course.matiere} · {course.niveau}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/professeur/cours/${course._id}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                  >
                    <Eye size={17} />
                    Voir le cours
                  </button>
                </div>
              </section>
            )}

            <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <ListChecks size={24} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    Questions du quiz
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Chaque question est reliée à une partie du cours et à une
                    compétence évaluée.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {quiz.questions.map((question, index) => {
                  const competence =
                    competenceLabel[question.competence || "autre"] || "Autre";

                  return (
                    <article
                      key={question._id}
                      className="rounded-[2rem] border border-slate-100 bg-slate-50/70 p-5 shadow-sm md:p-6"
                    >
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1.5 text-sm font-bold text-violet-700">
                          <Target size={16} />
                          Question {index + 1}
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={14} />
                          Correction disponible
                        </div>
                      </div>

                      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-violet-700">
                            <Layers size={15} />
                            Partie du cours
                          </div>

                          <p className="mt-2 text-sm font-bold text-slate-950">
                            {getPartTitle(question.partieId)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-700">
                            <Target size={15} />
                            Compétence évaluée
                          </div>

                          <p className="mt-2 text-sm font-bold text-slate-950">
                            {competence}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-5 text-slate-800 shadow-sm">
                        <MathContent content={question.question} />
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {question.choix.map((choix, choiceIndex) => {
                          const isCorrect = choix === question.bonneReponse;
                          const letter = String.fromCharCode(65 + choiceIndex);

                          return (
                            <div
                              key={`${question._id}-${choiceIndex}`}
                              className={`rounded-2xl border p-4 transition ${
                                isCorrect
                                  ? "border-emerald-200 bg-emerald-50 ring-2 ring-emerald-100"
                                  : "border-slate-100 bg-white"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                                    isCorrect
                                      ? "bg-emerald-600 text-white"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {letter}
                                </div>

                                <div
                                  className={
                                    isCorrect
                                      ? "text-emerald-800"
                                      : "text-slate-700"
                                  }
                                >
                                  <MathContent content={choix} />
                                </div>
                              </div>

                              {isCorrect && (
                                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
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