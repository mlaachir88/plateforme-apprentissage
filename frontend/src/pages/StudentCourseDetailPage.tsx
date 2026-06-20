import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Clock3,
  FileText,
  GraduationCap,
  Layers,
  ListChecks,
  PlayCircle,
  Sparkles,
} from "lucide-react";

import api from "../api/axios";
import StudentNav from "../components/StudentNav";
import MathContent from "../components/MathContent";

type CoursePart = {
  _id: string;
  titre: string;
  description: string;
};

type Course = {
  _id: string;
  titre: string;
  description: string;
  niveau: string;
  matiere: string;
  contenuTexte: string;
  pdfUrl?: string;
  parties?: CoursePart[];
};

type Quiz = {
  _id: string;
  titre: string;
  description: string;
  type: "diagnostic" | "practice";
  partieId?: string;
  questions: {
    _id: string;
    question: string;
    choix: string[];
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

function StudentCourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesResponse = await api.get("/courses");

        const selectedCourse = coursesResponse.data.find(
          (item: Course) => item._id === courseId
        );

        if (!selectedCourse) {
          setErreur("Cours introuvable ou accès refusé");
          return;
        }

        setCourse(selectedCourse);

        const quizzesResponse = await api.get(`/quizzes/course/${courseId}`);
        setQuizzes(quizzesResponse.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement du cours"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchData();
  }, [courseId]);

  const diagnosticQuiz = useMemo(
    () => quizzes.find((quiz) => quiz.type === "diagnostic"),
    [quizzes]
  );

  const sortedQuizzes = useMemo(() => {
    return [...quizzes].sort((a, b) => {
      if (a.type === "diagnostic" && b.type !== "diagnostic") {
        return -1;
      }

      if (a.type !== "diagnostic" && b.type === "diagnostic") {
        return 1;
      }

      return a.titre.localeCompare(b.titre);
    });
  }, [quizzes]);

  const getPartTitle = (partieId?: string) => {
    if (!course || !partieId) {
      return "";
    }

    const part = course.parties?.find(
      (coursePart) => coursePart._id === partieId
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

      <StudentNav />

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {chargement && (
          <section className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Clock3 size={23} />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Chargement du cours...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous récupérons le contenu, les parties et les quiz associés.
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
              onClick={() => navigate("/etudiant")}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
            >
              <ArrowLeft size={17} />
              Retour à mes cours
            </button>
          </section>
        )}

        {!chargement && !erreur && course && (
          <>
            <section className="mb-6 rounded-[2.4rem] border border-violet-100 bg-white/90 p-6 shadow-xl shadow-violet-100/40 backdrop-blur-2xl md:p-8">
              <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                    <GraduationCap size={16} />
                    {course.matiere} · {course.niveau}
                  </div>

                  <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                    {course.titre}
                  </h1>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                    {course.description}
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate("/etudiant")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                    >
                      <ArrowLeft size={17} />
                      Retour aux cours
                    </button>

                    {diagnosticQuiz && (
                      <button
                        onClick={() =>
                          navigate(`/etudiant/quiz/${diagnosticQuiz._id}`)
                        }
                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                      >
                        Commencer le diagnostic
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
                          Quiz disponibles
                        </p>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                          {quizzes.length}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm">
                        <ListChecks size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-fuchsia-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-fuchsia-700">
                          Parties du cours
                        </p>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                          {course.parties?.length || 0}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 shadow-sm">
                        <Layers size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-amber-700">
                          Type de contenu
                        </p>
                        <p className="mt-2 text-lg font-bold tracking-tight text-slate-950">
                          {course.pdfUrl ? "Texte + PDF" : "Texte"}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
                        <FileText size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {course.parties && course.parties.length > 0 && (
              <section className="mt-6 rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Layers size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      Parties du cours
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Ces parties seront utilisées pour analyser vos résultats.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {course.parties.map((part, index) => (
                    <article
                      key={part._id}
                      className="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                        Partie {index + 1}
                      </p>

                      <h3 className="mt-2 font-bold text-slate-950">
                        {part.titre}
                      </h3>

                      {part.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {part.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8 lg:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <BookOpen size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      Contenu du cours
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Support pédagogique associé à ce chapitre.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5 text-sm leading-7 text-slate-700 md:p-6">
                  {course.contenuTexte ? (
                    <MathContent content={course.contenuTexte} />
                  ) : (
                    "Aucun contenu texte disponible."
                  )}
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <ListChecks size={23} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-950">
                        Quiz général
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Diagnostic principal du cours.
                      </p>
                    </div>
                  </div>

                  {diagnosticQuiz ? (
                    <div className="mt-5 rounded-[1.7rem] border border-violet-100 bg-violet-50/60 p-5">
                      <span className="inline-flex rounded-full border border-violet-100 bg-white px-3 py-1 text-xs font-bold text-violet-700">
                        Diagnostic général
                      </span>

                      <h3 className="mt-3 font-bold text-slate-950">
                        {diagnosticQuiz.titre}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {diagnosticQuiz.description || "Quiz diagnostique"}
                      </p>

                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold text-slate-500">
                          Questions
                        </p>
                        <p className="mt-1 font-bold text-slate-950">
                          {diagnosticQuiz.questions.length} question(s)
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/etudiant/quiz/${diagnosticQuiz._id}`)
                        }
                        className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                      >
                        Commencer le diagnostic
                        <PlayCircle
                          size={18}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-5 text-sm text-slate-500">
                      Aucun diagnostic général disponible pour ce cours.
                    </div>
                  )}
                </div>

                <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <BrainCircuit size={23} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-950">
                        Diagnostic IA
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Consultez vos recommandations après le diagnostic.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Cours
                      </p>
                      <p className="mt-1 font-bold text-slate-950">
                        Disponible
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Quiz
                      </p>
                      <p className="mt-1 font-bold text-slate-950">
                        {quizzes.length} quiz disponible(s)
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Recommandations
                      </p>
                      <p className="mt-1 font-bold text-slate-950">
                        Après le diagnostic
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/etudiant/recommandations")}
                    className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm font-bold text-violet-700 transition hover:-translate-y-0.5 hover:bg-violet-50"
                  >
                    Voir mes recommandations
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </aside>
            </section>

            <section className="mt-6 rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                    <Sparkles size={16} />
                    Exercices et diagnostics
                  </div>

                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                    Quiz disponibles
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Passez un diagnostic général ou entraînez-vous sur une
                    partie ciblée.
                  </p>
                </div>
              </div>

              {sortedQuizzes.length === 0 ? (
                <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-6 text-sm text-slate-500">
                  Aucun quiz disponible pour ce cours.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {sortedQuizzes.map((quiz) => {
                    const partTitle = getPartTitle(quiz.partieId);

                    return (
                      <article
                        key={quiz._id}
                        className="rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                                quizTypeStyle[quiz.type || "diagnostic"]
                              }`}
                            >
                              {quizTypeLabel[quiz.type || "diagnostic"]}
                            </span>

                            <h3 className="mt-3 text-lg font-bold text-slate-950">
                              {quiz.titre}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {quiz.description || "Quiz pédagogique"}
                            </p>
                          </div>

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                            <ListChecks size={23} />
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3">
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold text-slate-500">
                              Questions
                            </p>
                            <p className="mt-1 font-bold text-slate-950">
                              {quiz.questions.length} question(s)
                            </p>
                          </div>

                          {partTitle && (
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                              <p className="text-xs font-bold text-emerald-700">
                                Partie ciblée
                              </p>
                              <p className="mt-1 font-bold text-emerald-900">
                                {partTitle}
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => navigate(`/etudiant/quiz/${quiz._id}`)}
                          className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                        >
                          {quiz.type === "practice"
                            ? "Commencer l’entraînement"
                            : "Commencer le diagnostic"}
                          <PlayCircle
                            size={18}
                            className="transition group-hover:translate-x-0.5"
                          />
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentCourseDetailPage;