import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  BrainCircuit,
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

type Student = {
  _id: string;
  prenom: string;
  nom: string;
  email: string;
  niveauScolaire: string;
  classe: string;
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
  studentsToSupport: {
    studentId: string;
    prenom: string;
    nom: string;
    email: string;
    niveauScolaire: string;
    classe: string;
    score: number;
    niveauDetecte: "weak" | "medium" | "strong";
    partieFaible: string;
    createdAt: string;
  }[];
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
  diagnostic: "bg-blue-50 text-blue-700 border-blue-200",
  practice: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const prioriteStyle = {
  prioritaire: "bg-rose-50 text-rose-700 border-rose-200",
  a_revoir: "bg-amber-50 text-amber-700 border-amber-200",
  satisfaisant: "bg-emerald-50 text-emerald-700 border-emerald-200",
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

      if (typeA === "diagnostic" && typeB !== "diagnostic") {
        return -1;
      }

      if (typeA !== "diagnostic" && typeB === "diagnostic") {
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
    <div className="min-h-screen bg-slate-50">
      <TeacherNav />

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
              onClick={() => navigate("/professeur/cours")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <ArrowLeft size={17} />
              Retour aux cours
            </button>
          </div>
        )}

        {!chargement && !erreur && course && (
          <>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-10 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.35),transparent_35%)]" />

                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                      <GraduationCap size={16} />
                      {course.matiere} · {course.niveau}
                    </div>

                    <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
                      {course.titre}
                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate("/professeur/cours")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                    >
                      <ArrowLeft size={17} />
                      Retour
                    </button>

                    <button
                      onClick={() => navigate("/professeur/cours/acces")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
                    >
                      <Users size={17} />
                      Gérer les accès
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                    <ListChecks size={18} />
                    Quiz associés
                  </div>

                  <p className="mt-3 text-3xl font-bold text-blue-800">
                    {quizzes.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Users size={18} />
                    Étudiants autorisés
                  </div>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {course.etudiantsAutorises?.length || 0}
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
                      Ces parties sont utilisées pour l’analyse adaptative des
                      résultats.
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
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <BookOpen size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Contenu du cours
                    </h2>

                    <p className="text-sm text-slate-500">
                      Support pédagogique visible par les étudiants autorisés.
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

              <aside className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Target size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Quiz général
                      </h2>

                      <p className="text-sm text-slate-500">
                        Diagnostic principal associé au cours.
                      </p>
                    </div>
                  </div>

                  {diagnosticQuiz ? (
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                      <span className="inline-flex rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                        Diagnostic général
                      </span>

                      <h3 className="mt-3 font-bold text-slate-900">
                        {diagnosticQuiz.titre}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {diagnosticQuiz.description || "Quiz diagnostique"}
                      </p>

                      <div className="mt-4 rounded-2xl bg-white/80 p-4">
                        <p className="text-xs text-slate-500">Questions</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {diagnosticQuiz.questions.length} question(s)
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/professeur/quiz/${diagnosticQuiz._id}`)
                        }
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Voir le diagnostic
                        <PlayCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                      Aucun quiz diagnostic général n’a encore été créé pour ce
                      cours.
                    </div>
                  )}

                  <button
                    onClick={() => navigate("/professeur/quiz/nouveau")}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <PlusCircle size={18} />
                    Ajouter un quiz
                  </button>
                </div>

                <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <BrainCircuit size={23} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">
                          Analyse IA de la classe
                        </h2>

                        {teacherAnalysis?.ai && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
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
                        Synthèse des résultats et plan d’action.
                      </p>
                    </div>
                  </div>

                  {chargementAnalyse && (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                      Génération de l’analyse IA...
                    </div>
                  )}

                  {!chargementAnalyse && erreurAnalyse && (
                    <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
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
                      <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                        Aucun résultat disponible pour générer une analyse.
                      </div>
                    )}

                  {!chargementAnalyse &&
                    !erreurAnalyse &&
                    teacherAnalysis?.ai && (
                      <div className="mt-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-indigo-50 p-4">
                            <p className="text-xs text-indigo-700">
                              Score moyen
                            </p>
                            <p className="mt-1 text-2xl font-bold text-indigo-900">
                              {teacherAnalysis.stats.averageScore}%
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                              Élèves analysés
                            </p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">
                              {teacherAnalysis.stats.studentsWithResults}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                          <p className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                            <Sparkles size={16} />
                            Synthèse IA
                          </p>

                          <p className="mt-2 text-sm leading-6 text-indigo-800">
                            {teacherAnalysis.ai.synthese}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-900">
                            Plan d’action pédagogique
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {teacherAnalysis.ai.planAction}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-violet-50 p-5">
                          <p className="text-sm font-semibold text-violet-900">
                            Groupes et accompagnement
                          </p>

                          <p className="mt-2 text-sm leading-6 text-violet-800">
                            {teacherAnalysis.ai.groupes}
                          </p>
                        </div>

                        {teacherAnalysis.partiesAnalysis.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Parties prioritaires
                            </p>

                            <div className="mt-3 space-y-2">
                              {teacherAnalysis.partiesAnalysis
                                .slice(0, 3)
                                .map((partie) => (
                                  <div
                                    key={partie.partieId}
                                    className="rounded-2xl border border-slate-200 bg-white p-4"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-semibold text-slate-900">
                                          {partie.titre}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                          Score moyen : {partie.scoreMoyen}%
                                        </p>
                                      </div>

                                      <span
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
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
                            <p className="text-sm font-semibold text-slate-900">
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
                                    <p className="font-semibold text-rose-900">
                                      {student.prenom} {student.nom}
                                    </p>

                                    <p className="mt-1 text-sm text-rose-700">
                                      Score : {student.score}% ·{" "}
                                      {niveauLabel[student.niveauDetecte]}
                                    </p>

                                    {student.partieFaible && (
                                      <p className="mt-1 text-xs text-rose-600">
                                        Partie faible : {student.partieFaible}
                                      </p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <ShieldCheck size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Accès étudiants
                      </h2>

                      <p className="text-sm text-slate-500">
                        Étudiants qui peuvent consulter ce cours.
                      </p>
                    </div>
                  </div>

                  {!course.etudiantsAutorises ||
                  course.etudiantsAutorises.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                      Aucun étudiant n’a encore accès à ce cours.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {course.etudiantsAutorises.map((student) => (
                        <div
                          key={student._id}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <p className="font-semibold text-slate-900">
                            {student.prenom} {student.nom}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {student.email}
                          </p>

                          <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {student.niveauScolaire} · {student.classe}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => navigate("/professeur/cours/acces")}
                    className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Modifier les accès
                  </button>
                </div>
              </aside>
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    <ListChecks size={16} />
                    Évaluations
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    Quiz du cours
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Diagnostic général et entraînements associés à ce cours.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/professeur/quiz/nouveau")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <PlusCircle size={18} />
                  Ajouter un quiz
                </button>
              </div>

              {sortedQuizzes.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
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
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                quizTypeStyle[quizType]
                              }`}
                            >
                              {quizTypeLabel[quizType]}
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
                          onClick={() =>
                            navigate(`/professeur/quiz/${quiz._id}`)
                          }
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
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
          </>
        )}
      </main>
    </div>
  );
}

export default TeacherCourseDetailPage;