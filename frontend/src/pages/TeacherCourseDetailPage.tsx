import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
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
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import api from "../api/axios";
import TeacherNav from "../components/TeacherNav";
import MathContent from "../components/MathContent";

type Profile = {
  avatarUrl?: string;
  avatarPublicId?: string;
};

type Student = {
  _id: string;
  prenom: string;
  nom: string;
  email: string;
  niveauScolaire: string;
  classe: string;
  profile?: Profile;
};

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
  etudiantsAutorises?: Student[];
};

type Quiz = {
  _id: string;
  titre: string;
  description: string;
  type?: "diagnostic" | "practice";
  partieId?: string;
  questions: {
    _id: string;
    question: string;
    choix: string[];
    partieId?: string;
    competence?: string;
  }[];
};

type StudentToSupport = {
  studentId: string;
  prenom: string;
  nom: string;
  email: string;
  niveauScolaire: string;
  classe: string;
  profile?: Profile;
  score: number;
  niveauDetecte: "weak" | "medium" | "strong";
  partieFaible: string;
  createdAt: string;
};

type TeacherAnalysis = {
  source: "openai" | "fallback" | "none";
  errorCode?: string;
  stats: {
    studentsCount: number;
    studentsWithResults: number;
    resultsCount: number;
    latestResultsCount: number;
    averageScore: number;
  };
  partiesAnalysis: {
    partieId: string;
    titre: string;
    scoreMoyen: number;
    statut: "maitrise" | "a_renforcer" | "fragile";
    priorite: "prioritaire" | "a_revoir" | "satisfaisant";
    totalQuestions: number;
    bonnesReponses: number;
    studentsCount: number;
  }[];
  competencesFaibles: {
    competence: string;
    erreurs: number;
  }[];
  studentsToSupport: StudentToSupport[];
  ai: {
    source: "openai" | "fallback";
    errorCode?: string;
    synthese: string;
    planAction: string;
    groupes: string;
    resumeClasse: string;
  } | null;
};

const quizTypeLabel = {
  diagnostic: "Diagnostic général",
  practice: "Exercice d’entraînement",
};

const quizTypeStyle = {
  diagnostic: "border-violet-100 bg-violet-50 text-violet-700",
  practice: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

const prioriteStyle = {
  prioritaire: "border-rose-100 bg-rose-50 text-rose-700",
  a_revoir: "border-amber-100 bg-amber-50 text-amber-700",
  satisfaisant: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

const prioriteLabel = {
  prioritaire: "Prioritaire",
  a_revoir: "À revoir",
  satisfaisant: "Satisfaisant",
};

const niveauLabel = {
  weak: "À renforcer",
  medium: "Moyen",
  strong: "Solide",
};


const getStudentInitials = (
  student?: Pick<Student, "prenom" | "nom"> | StudentToSupport
) => {
  const first = student?.prenom?.trim()?.[0] || "";
  const last = student?.nom?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || "E";
};

const StudentAvatar = ({
  student,
  variant = "violet",
  size = "md",
}: {
  student?: (Pick<Student, "prenom" | "nom" | "profile"> & {
    profile?: Profile;
  }) | StudentToSupport;
  variant?: "violet" | "rose" | "emerald";
  size?: "sm" | "md";
}) => {
  const avatarUrl = student?.profile?.avatarUrl || "";
  const sizeClass = size === "sm" ? "h-11 w-11" : "h-12 w-12";

  const ringClass =
    variant === "rose"
      ? "ring-rose-100"
      : variant === "emerald"
      ? "ring-emerald-100"
      : "ring-violet-100";

  const fallbackClass =
    variant === "rose"
      ? "bg-rose-100 text-rose-700"
      : variant === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-violet-50 text-violet-700";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={
          student?.prenom && student?.nom
            ? `${student.prenom} ${student.nom}`
            : "Étudiant"
        }
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-4 ${ringClass}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full text-sm font-black ${fallbackClass} ring-4 ${ringClass}`}
    >
      {getStudentInitials(student)}
    </div>
  );
};

function TeacherCourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [teacherAnalysis, setTeacherAnalysis] =
    useState<TeacherAnalysis | null>(null);

  const [chargement, setChargement] = useState(true);
  const [chargementAnalyse, setChargementAnalyse] = useState(false);
  const [erreur, setErreur] = useState("");
  const [erreurAnalyse, setErreurAnalyse] = useState("");

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const coursesResponse = await api.get("/courses");

        const selectedCourse = coursesResponse.data.find(
          (item: Course) => item._id === courseId
        );

        if (!selectedCourse) {
          setErreur("Cours introuvable");
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

    fetchCourseDetail();
  }, [courseId]);

  useEffect(() => {
    const fetchTeacherAnalysis = async () => {
      if (!courseId) {
        return;
      }

      setChargementAnalyse(true);
      setErreurAnalyse("");

      try {
        const response = await api.get(
          `/results/course/${courseId}/teacher-analysis`
        );

        setTeacherAnalysis(response.data);
      } catch (error: any) {
        setErreurAnalyse(
          error.response?.data?.message ||
            "Erreur lors du chargement de l’analyse IA"
        );
      } finally {
        setChargementAnalyse(false);
      }
    };

    fetchTeacherAnalysis();
  }, [courseId]);

  const diagnosticQuiz = useMemo(
    () => quizzes.find((quiz) => (quiz.type || "diagnostic") === "diagnostic"),
    [quizzes]
  );

  const sortedQuizzes = useMemo(() => {
    return [...quizzes].sort((a, b) => {
      const typeA = a.type || "diagnostic";
      const typeB = b.type || "diagnostic";

      if (typeA === "diagnostic" && typeB !== "diagnostic") return -1;
      if (typeA !== "diagnostic" && typeB === "diagnostic") return 1;

      return a.titre.localeCompare(b.titre);
    });
  }, [quizzes]);

  const totalQuestions = useMemo(() => {
    return quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);
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
                  Chargement du cours...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous récupérons les détails du cours.
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
              onClick={() => navigate("/professeur/cours")}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
            >
              <ArrowLeft size={17} />
              Retour aux cours
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
                    {course.description || "Cours pédagogique"}
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate("/professeur/cours")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                    >
                      <ArrowLeft size={17} />
                      Retour aux cours
                    </button>

                    <button
                      onClick={() => navigate("/professeur/cours/acces")}
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                    >
                      <Users size={17} />
                      Gérer les accès
                      <ArrowRight
                        size={17}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-violet-700">
                          Quiz associés
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

                  <div className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-emerald-700">
                          Étudiants
                        </p>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                          {course.etudiantsAutorises?.length || 0}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
                        <Users size={24} />
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
                          {totalQuestions}
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

            {course.parties && course.parties.length > 0 && (
              <section className="mb-6 rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Layers size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      Parties du cours
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Ces parties sont utilisées pour l’analyse adaptative des
                      résultats et les recommandations.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {course.parties.map((part, index) => (
                    <div
                      key={part._id}
                      className="rounded-[1.7rem] border border-violet-100 bg-violet-50/60 p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
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
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <BookOpen size={24} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                        Contenu du cours
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Support pédagogique visible par les étudiants autorisés.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-6 text-sm leading-7 text-slate-700">
                    {course.contenuTexte ? (
                      <MathContent content={course.contenuTexte} />
                    ) : (
                      "Aucun contenu texte disponible."
                    )}
                  </div>

                  {course.pdfUrl && (
                    <a
                      href={course.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                    >
                      <FileText size={17} />
                      Ouvrir le PDF du cours
                    </a>
                  )}
                </section>

                <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                        <ListChecks size={16} />
                        Évaluations
                      </div>

                      <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                        Quiz du cours
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        Diagnostic général et entraînements associés à ce cours.
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/professeur/quiz/nouveau")}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                    >
                      <PlusCircle size={18} />
                      Ajouter un quiz
                    </button>
                  </div>

                  {sortedQuizzes.length === 0 ? (
                    <div className="mt-6 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-6 text-sm text-slate-500">
                      Aucun quiz n’a encore été créé pour ce cours.
                    </div>
                  ) : (
                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                      {sortedQuizzes.map((quiz) => {
                        const quizType = quiz.type || "diagnostic";
                        const partTitle = getPartTitle(quiz.partieId);

                        return (
                          <article
                            key={quiz._id}
                            className="rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                                    quizTypeStyle[quizType]
                                  }`}
                                >
                                  {quizTypeLabel[quizType]}
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
                              onClick={() =>
                                navigate(`/professeur/quiz/${quiz._id}`)
                              }
                              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                            >
                              {quizType === "practice"
                                ? "Voir l’entraînement"
                                : "Voir le diagnostic"}
                              <PlayCircle size={18} />
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <Target size={22} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-950">
                        Quiz général
                      </h2>
                      <p className="text-sm text-slate-500">
                        Diagnostic principal.
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

                      <div className="mt-4 rounded-2xl bg-white/80 p-4">
                        <p className="text-xs text-slate-500">Questions</p>
                        <p className="mt-1 font-bold text-slate-950">
                          {diagnosticQuiz.questions.length} question(s)
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/professeur/quiz/${diagnosticQuiz._id}`)
                        }
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                      >
                        Voir le diagnostic
                        <PlayCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                      Aucun quiz diagnostic général n’a encore été créé pour ce
                      cours.
                    </div>
                  )}

                  <button
                    onClick={() => navigate("/professeur/quiz/nouveau")}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
                  >
                    <PlusCircle size={18} />
                    Ajouter un quiz
                  </button>
                </section>

                <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <BrainCircuit size={22} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-slate-950">
                          Analyse IA
                        </h2>

                        {teacherAnalysis?.ai && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                              teacherAnalysis.ai.source === "openai"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Sparkles size={13} />
                            {teacherAnalysis.ai.source === "openai"
                              ? "IA"
                              : "Auto"}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-500">
                        Synthèse et plan d’action.
                      </p>
                    </div>
                  </div>

                  {chargementAnalyse && (
                    <div className="mt-5 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                      Génération de l’analyse IA...
                    </div>
                  )}

                  {!chargementAnalyse && erreurAnalyse && (
                    <div className="mt-5 rounded-[1.7rem] border border-red-100 bg-red-50 p-5 text-sm text-red-700">
                      <div className="flex gap-2">
                        <AlertCircle size={18} />
                        <span>{erreurAnalyse}</span>
                      </div>
                    </div>
                  )}

                  {!chargementAnalyse &&
                    !erreurAnalyse &&
                    teacherAnalysis &&
                    !teacherAnalysis.ai && (
                      <div className="mt-5 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                        Aucun résultat disponible pour générer une analyse.
                      </div>
                    )}

                  {!chargementAnalyse &&
                    !erreurAnalyse &&
                    teacherAnalysis?.ai && (
                      <div className="mt-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                            <p className="text-xs font-bold text-violet-700">
                              Score moyen
                            </p>
                            <p className="mt-1 text-2xl font-bold text-slate-950">
                              {teacherAnalysis.stats.averageScore}%
                            </p>
                          </div>

                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                            <p className="text-xs font-bold text-emerald-700">
                              Élèves analysés
                            </p>
                            <p className="mt-1 text-2xl font-bold text-slate-950">
                              {teacherAnalysis.stats.studentsWithResults}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
                          <p className="flex items-center gap-2 text-sm font-bold text-violet-900">
                            <Sparkles size={16} />
                            Synthèse IA
                          </p>

                          <div className="mt-2 text-sm leading-6 text-violet-800">
                            <MathContent
                              content={teacherAnalysis.ai.synthese}
                            />
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                          <p className="text-sm font-bold text-slate-950">
                            Plan d’action pédagogique
                          </p>

                          <div className="mt-2 text-sm leading-6 text-slate-600">
                            <MathContent
                              content={teacherAnalysis.ai.planAction}
                            />
                          </div>
                        </div>

                        <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/60 p-5">
                          <p className="text-sm font-bold text-fuchsia-900">
                            Groupes et accompagnement
                          </p>

                          <div className="mt-2 text-sm leading-6 text-fuchsia-800">
                            <MathContent content={teacherAnalysis.ai.groupes} />
                          </div>
                        </div>

                        {teacherAnalysis.partiesAnalysis.length > 0 && (
                          <div>
                            <p className="text-sm font-bold text-slate-950">
                              Parties prioritaires
                            </p>

                            <div className="mt-3 space-y-2">
                              {teacherAnalysis.partiesAnalysis
                                .slice(0, 3)
                                .map((partie) => (
                                  <div
                                    key={partie.partieId}
                                    className="rounded-2xl border border-slate-100 bg-white p-4"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-bold text-slate-950">
                                          {partie.titre}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                          Score moyen : {partie.scoreMoyen}%
                                        </p>
                                      </div>

                                      <span
                                        className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${
                                          prioriteStyle[partie.priorite]
                                        }`}
                                      >
                                        {prioriteLabel[partie.priorite]}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {teacherAnalysis.studentsToSupport.length > 0 && (
                          <div>
                            <p className="text-sm font-bold text-slate-950">
                              Élèves à accompagner
                            </p>

                            <div className="mt-3 space-y-2">
                              {teacherAnalysis.studentsToSupport
                                .slice(0, 3)
                                .map((student) => (
                                  <div
                                    key={student.studentId}
                                    className="rounded-2xl border border-rose-100 bg-rose-50 p-4"
                                  >
                                    <div className="flex items-start gap-3">
                                      <StudentAvatar
                                        student={student}
                                        variant="rose"
                                        size="sm"
                                      />

                                      <div className="min-w-0">
                                        <p className="truncate font-bold text-rose-900">
                                          {student.prenom} {student.nom}
                                        </p>

                                        <p className="mt-1 text-sm text-rose-700">
                                          Score : {student.score}% ·{" "}
                                          <span className="whitespace-nowrap">
                                            {
                                              niveauLabel[
                                                student.niveauDetecte
                                              ]
                                            }
                                          </span>
                                        </p>

                                        {student.partieFaible && (
                                          <p className="mt-1 line-clamp-2 text-xs text-rose-600">
                                            Partie faible :{" "}
                                            {student.partieFaible}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </section>

                <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <ShieldCheck size={22} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-950">
                        Accès étudiants
                      </h2>

                      <p className="text-sm text-slate-500">
                        Étudiants autorisés.
                      </p>
                    </div>
                  </div>

                  {!course.etudiantsAutorises ||
                  course.etudiantsAutorises.length === 0 ? (
                    <div className="mt-5 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                      Aucun étudiant n’a encore accès à ce cours.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {course.etudiantsAutorises.slice(0, 5).map((student) => (
                        <div
                          key={student._id}
                          className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4"
                        >
                          <StudentAvatar
                            student={student}
                            variant="emerald"
                            size="sm"
                          />

                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-950">
                              {student.prenom} {student.nom}
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-500">
                              {student.email}
                            </p>

                            <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                              {student.niveauScolaire} · {student.classe}
                            </div>
                          </div>
                        </div>
                      ))}

                      {course.etudiantsAutorises.length > 5 && (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-500">
                          +{course.etudiantsAutorises.length - 5} autre(s)
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => navigate("/professeur/cours/acces")}
                    className="mt-5 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
                  >
                    Modifier les accès
                  </button>
                </section>
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default TeacherCourseDetailPage;