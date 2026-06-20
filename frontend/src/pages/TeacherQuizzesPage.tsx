import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Eye,
  FileQuestion,
  Layers,
  ListChecks,
  PlusCircle,
  Sparkles,
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
  diagnostic: "border-violet-100 bg-violet-50 text-violet-700",
  practice: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
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
          error.response?.data?.message || "Erreur lors du chargement des quiz"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchQuizzes();
  }, []);

  const diagnosticCount = useMemo(() => {
    return quizzes.filter((quiz) => quiz.type === "diagnostic").length;
  }, [quizzes]);

  const practiceCount = useMemo(() => {
    return quizzes.filter((quiz) => quiz.type === "practice").length;
  }, [quizzes]);

  const totalQuestions = useMemo(() => {
    return quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);
  }, [quizzes]);

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
    <div className="min-h-screen overflow-hidden bg-[#fbf8ff] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute right-[-220px] top-[260px] h-[460px] w-[460px] rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="absolute bottom-[-240px] left-[-160px] h-[500px] w-[500px] rounded-full bg-amber-100/35 blur-3xl" />
      </div>

      <TeacherNav />

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-6 rounded-[2.4rem] border border-violet-100 bg-white/90 p-6 shadow-xl shadow-violet-100/40 backdrop-blur-2xl md:p-8">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                <FileQuestion size={16} />
                Gestion des quiz
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                Mes quiz pédagogiques
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Retrouvez vos quiz diagnostiques et vos exercices
                d’entraînement associés aux parties de vos cours.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/professeur/quiz/nouveau")}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                >
                  <PlusCircle size={18} />
                  Créer un quiz
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-0.5"
                  />
                </button>

                <button
                  onClick={() => navigate("/professeur/cours")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                >
                  <BookOpen size={18} />
                  Voir les cours
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-violet-700">
                      Quiz créés
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : quizzes.length}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm">
                    <FileQuestion size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-emerald-700">
                      Entraînements
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : practiceCount}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
                    <ListChecks size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-amber-700">
                      Questions
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : totalQuestions}
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

        {chargement && (
          <section className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Clock3 size={23} />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Chargement des quiz...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous récupérons vos quiz pédagogiques.
                </p>
              </div>
            </div>
          </section>
        )}

        {erreur && (
          <section className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <p className="font-bold">Une erreur est survenue</p>
            <p className="mt-2 text-sm leading-6">{erreur}</p>
          </section>
        )}

        {!chargement && !erreur && courses.length === 0 && (
          <section className="rounded-[2.3rem] border border-violet-100 bg-white/95 p-10 text-center shadow-xl shadow-violet-100/40 backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-violet-50 text-violet-600 shadow-sm">
              <BookOpen size={40} />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Aucun cours créé
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              Créez d’abord un cours avant d’ajouter un quiz diagnostique ou un
              exercice d’entraînement.
            </p>

            <button
              onClick={() => navigate("/professeur/cours/nouveau")}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              <PlusCircle size={18} />
              Créer un cours
            </button>
          </section>
        )}

        {!chargement &&
          !erreur &&
          courses.length > 0 &&
          quizzes.length === 0 && (
            <section className="rounded-[2.3rem] border border-violet-100 bg-white/95 p-10 text-center shadow-xl shadow-violet-100/40 backdrop-blur-xl">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-violet-50 text-violet-600 shadow-sm">
                <FileQuestion size={40} />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Aucun quiz créé
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                Créez un quiz diagnostique pour analyser les résultats par
                partie, ou un exercice d’entraînement pour alimenter les
                recommandations.
              </p>

              <button
                onClick={() => navigate("/professeur/quiz/nouveau")}
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
              >
                <PlusCircle size={18} />
                Créer un quiz
              </button>
            </section>
          )}

        {!chargement && !erreur && quizzes.length > 0 && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {quizzes.map((quiz) => {
                const course =
                  typeof quiz.course === "string" ? null : quiz.course;

                const partTitle = getPartTitle(quiz, course);

                return (
                  <article
                    key={quiz._id}
                    className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/25 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-100/50 md:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                          <FileQuestion size={28} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${
                                quizTypeStyle[quiz.type || "diagnostic"]
                              }`}
                            >
                              <Target size={13} />
                              {quizTypeLabel[quiz.type || "diagnostic"]}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                              <ListChecks size={13} />
                              {quiz.questions.length} question(s)
                            </span>

                            {partTitle && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                Partie : {partTitle}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
                            {quiz.titre}
                          </h3>

                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            {quiz.description || "Quiz pédagogique"}
                          </p>

                          {course && (
                            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50/60 px-3 py-2 text-sm font-bold text-violet-700">
                              <BookOpen size={16} />
                              {course.titre} · {course.matiere} ·{" "}
                              {course.niveau}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:items-end">
                        <p className="text-xs font-bold text-slate-400">
                          Créé le {formatDate(quiz.createdAt)}
                        </p>

                        <button
                          onClick={() => navigate(`/professeur/quiz/${quiz._id}`)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                        >
                          <Eye size={17} />
                          Voir le quiz
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <Sparkles size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        Résumé des quiz
                      </h3>
                      <p className="text-sm text-slate-500">
                        Vue rapide.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                      <p className="text-xs font-bold text-violet-700">
                        Total quiz
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {quizzes.length}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-bold text-emerald-700">
                        Entraînements
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {practiceCount}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs font-bold text-amber-700">
                        Diagnostics
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {diagnosticCount}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 p-4">
                      <p className="text-xs font-bold text-fuchsia-700">
                        Questions
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <Layers size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        Actions rapides
                      </h3>
                      <p className="text-sm text-slate-500">
                        Continuer le travail.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <button
                      onClick={() => navigate("/professeur/quiz/nouveau")}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      Créer un quiz
                      <ArrowRight size={16} />
                    </button>

                    <button
                      onClick={() => navigate("/professeur/cours")}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      Voir mes cours
                      <ArrowRight size={16} />
                    </button>

                    <button
                      onClick={() => navigate("/professeur/resultats")}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      Résultats étudiants
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

export default TeacherQuizzesPage;