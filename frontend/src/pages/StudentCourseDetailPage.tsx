import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  GraduationCap,
  Layers,
  ListChecks,
  PlayCircle,
  Target,
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
  diagnostic: "bg-blue-50 text-blue-700 border-blue-200",
  practice: "bg-emerald-50 text-emerald-700 border-emerald-200",
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

  const getPartTitle = (partieId?: string) => {
    if (!course || !partieId) {
      return "";
    }

    const part = course.parties?.find((coursePart) => coursePart._id === partieId);

    return part?.titre || "";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {chargement && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
            Chargement du cours...
          </div>
        )}

        {erreur && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {erreur}

            <button
              onClick={() => navigate("/etudiant")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <ArrowLeft size={17} />
              Retour à mes cours
            </button>
          </div>
        )}

        {!chargement && !erreur && course && (
          <>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 px-8 py-10 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_35%)]" />

                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                      <GraduationCap size={16} />
                      {course.matiere} · {course.niveau}
                    </div>

                    <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
                      {course.titre}
                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85">
                      {course.description}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/etudiant")}
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
                    <ListChecks size={18} />
                    Quiz disponibles
                  </div>

                  <p className="mt-3 text-3xl font-bold text-blue-800">
                    {quizzes.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Layers size={18} />
                    Parties du cours
                  </div>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {course.parties?.length || 0}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <FileText size={18} />
                    Type de contenu
                  </div>

                  <p className="mt-3 text-lg font-bold text-slate-900">
                    {course.pdfUrl ? "Texte + PDF" : "Texte"}
                  </p>
                </div>
              </div>
            </section>

            {course.parties && course.parties.length > 0 && (
              <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Layers size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Parties du cours
                    </h2>

                    <p className="text-sm text-slate-500">
                      Ces parties seront utilisées pour analyser vos résultats.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {course.parties.map((part, index) => (
                    <div
                      key={part._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <p className="text-xs font-semibold uppercase text-blue-600">
                        Partie {index + 1}
                      </p>

                      <h3 className="mt-2 font-bold text-slate-900">
                        {part.titre}
                      </h3>

                      {part.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {part.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <BookOpen size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Contenu du cours
                    </h2>

                    <p className="text-sm text-slate-500">
                      Support pédagogique associé à ce chapitre.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-700">
                  {course.contenuTexte ? (
                    <MathContent content={course.contenuTexte} />
                  ) : (
                    "Aucun contenu texte disponible."
                  )}
                </div>
              </div>

              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Target size={23} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Diagnostic
                    </h2>

                    <p className="text-sm text-slate-500">
                      Passez le quiz général pour obtenir une analyse par partie.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Cours</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      Disponible
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Quiz</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {quizzes.length} exercice(s)
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Recommandations</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      Après le diagnostic
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/etudiant/recommandations")}
                  className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Voir mes recommandations
                </button>
              </aside>
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    <ListChecks size={16} />
                    Exercices
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    Quiz disponibles
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Passez un diagnostic général ou entraînez-vous sur une partie ciblée.
                  </p>
                </div>
              </div>

              {quizzes.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                  Aucun quiz disponible pour ce cours.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {quizzes.map((quiz) => {
                    const partTitle = getPartTitle(quiz.partieId);

                    return (
                      <article
                        key={quiz._id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                quizTypeStyle[quiz.type || "diagnostic"]
                              }`}
                            >
                              {quizTypeLabel[quiz.type || "diagnostic"]}
                            </span>

                            <h3 className="mt-3 text-lg font-bold text-slate-900">
                              {quiz.titre}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {quiz.description || "Quiz pédagogique"}
                            </p>
                          </div>

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <ListChecks size={23} />
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Questions</p>
                            <p className="mt-1 font-semibold text-slate-900">
                              {quiz.questions.length} question(s)
                            </p>
                          </div>

                          {partTitle && (
                            <div className="rounded-2xl bg-emerald-50 p-4">
                              <p className="text-xs text-emerald-700">
                                Partie ciblée
                              </p>
                              <p className="mt-1 font-semibold text-emerald-900">
                                {partTitle}
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => navigate(`/etudiant/quiz/${quiz._id}`)}
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          {quiz.type === "practice"
                            ? "Commencer l’entraînement"
                            : "Commencer le diagnostic"}
                          <PlayCircle size={18} />
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