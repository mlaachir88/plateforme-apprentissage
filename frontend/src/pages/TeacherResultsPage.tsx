import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import api from "../api/axios";
import TeacherNav from "../components/TeacherNav";

type Result = {
  _id: string;
  score: number;
  niveauDetecte: "weak" | "medium" | "strong";
  bonnesReponses: number;
  totalQuestions: number;
  tentative?: number;
  createdAt: string;
  updatedAt: string;
  student?: {
    prenom: string;
    nom: string;
    email: string;
    niveauScolaire: string;
    classe: string;
    profile?: {
      avatarUrl?: string;
      avatarPublicId?: string;
    };
  };
  quiz?: {
    titre: string;
    difficulte: "easy" | "medium" | "hard";
  };
  course?: {
    titre: string;
    matiere: string;
    niveau: string;
  };
};

const RESULTS_PER_PAGE = 8;

const niveauLabel = {
  weak: "À renforcer",
  medium: "Moyen",
  strong: "Solide",
};

const niveauStyle = {
  weak: "border-rose-100 bg-rose-50 text-rose-700",
  medium: "border-amber-100 bg-amber-50 text-amber-700",
  strong: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

const difficulteLabel = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

const difficulteStyle = {
  easy: "border-emerald-100 bg-emerald-50 text-emerald-700",
  medium: "border-amber-100 bg-amber-50 text-amber-700",
  hard: "border-rose-100 bg-rose-50 text-rose-700",
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getStudentInitials = (student?: Result["student"]) => {
  const first = student?.prenom?.trim()?.[0] || "";
  const last = student?.nom?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || "E";
};

const StudentAvatar = ({ student }: { student?: Result["student"] }) => {
  const avatarUrl = student?.profile?.avatarUrl || "";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={
          student?.prenom && student?.nom
            ? `${student.prenom} ${student.nom}`
            : "Étudiant"
        }
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-4 ring-violet-100"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-black text-violet-700 ring-4 ring-violet-100">
      {getStudentInitials(student)}
    </div>
  );
};

function TeacherResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get("/results/teacher");
        setResults(response.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement des résultats"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchResults();
  }, []);

  const sortedResults = useMemo(() => {
    return [...results].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [results]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedResults.length / RESULTS_PER_PAGE));
  }, [sortedResults.length]);

  const displayedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    return sortedResults.slice(startIndex, startIndex + RESULTS_PER_PAGE);
  }, [sortedResults, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
  };

  const averageScore = useMemo(() => {
    if (results.length === 0) return 0;

    const total = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / results.length);
  }, [results]);

  const bestScore = useMemo(() => {
    if (results.length === 0) return 0;

    return Math.max(...results.map((result) => result.score));
  }, [results]);

  const weakCount = useMemo(() => {
    return results.filter((result) => result.niveauDetecte === "weak").length;
  }, [results]);

  const strongCount = useMemo(() => {
    return results.filter((result) => result.niveauDetecte === "strong").length;
  }, [results]);

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
                <BrainCircuit size={16} />
                Suivi pédagogique
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                Résultats des étudiants
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Consultez les scores, les niveaux détectés, les tentatives et
                l’évolution des étudiants sur vos cours et vos quiz.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-violet-700">
                      Moyenne générale
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : `${averageScore}%`}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm">
                    <BarChart3 size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-emerald-700">
                      Meilleur score
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : `${bestScore}%`}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
                    <Trophy size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-rose-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-rose-700">
                      À renforcer
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : weakCount}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm">
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
                  Chargement des résultats...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous récupérons les résultats de vos étudiants.
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

        {!chargement && !erreur && results.length === 0 && (
          <section className="rounded-[2.3rem] border border-violet-100 bg-white/95 p-10 text-center shadow-xl shadow-violet-100/40 backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-violet-50 text-violet-600 shadow-sm">
              <BarChart3 size={40} />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Aucun résultat disponible
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              Les résultats apparaîtront ici après le passage des quiz par les
              étudiants.
            </p>
          </section>
        )}

        {!chargement && !erreur && results.length > 0 && (
          <section className="space-y-6">
            <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Sparkles size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">
                    Résumé pédagogique
                  </h2>
                  <p className="text-sm text-slate-500">
                    Vue rapide de la classe.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                  <p className="text-xs font-bold text-violet-700">
                    Résultats
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {results.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-bold text-emerald-700">
                    Niveaux solides
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {strongCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                  <p className="text-xs font-bold text-rose-700">
                    À renforcer
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {weakCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-xs font-bold text-amber-700">
                    Meilleur score
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {bestScore}%
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <BrainCircuit size={20} />
                  </div>

                  <div>
                    <p className="font-bold text-slate-950">Lecture rapide</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Les élèves en niveau “À renforcer” doivent être priorisés
                      dans le suivi ou les exercices d’entraînement.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[2.2rem] border border-violet-100 bg-white/95 shadow-xl shadow-violet-100/30 backdrop-blur-xl">
              <div className="flex flex-col gap-4 border-b border-violet-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Users size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-950">
                      Historique des résultats
                    </h2>

                    <p className="text-sm text-slate-500">
                      Dernières performances enregistrées.
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                  <CheckCircle2 size={16} />
                  {results.length} résultat(s)
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1160px] text-left text-sm">
                  <thead className="bg-violet-50/60 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-bold">Étudiant</th>
                      <th className="px-6 py-4 font-bold">Classe</th>
                      <th className="px-6 py-4 font-bold">Cours</th>
                      <th className="px-6 py-4 font-bold">Quiz</th>
                      <th className="px-6 py-4 font-bold">Score</th>
                      <th className="px-6 py-4 font-bold">Niveau</th>
                      <th className="px-6 py-4 font-bold">Tentative</th>
                      <th className="px-6 py-4 font-bold">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {displayedResults.map((result) => (
                      <tr key={result._id} className="hover:bg-violet-50/35">
                        <td className="px-6 py-4 align-middle">
                          <div className="flex min-w-0 items-center gap-3">
                            <StudentAvatar student={result.student} />

                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-950">
                                {result.student?.prenom || "Étudiant"}{" "}
                                {result.student?.nom || ""}
                              </p>
                              <p className="truncate text-xs font-semibold text-slate-500">
                                {result.student?.email || "Email non disponible"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 align-middle text-slate-600">
                          <p className="font-semibold leading-6">
                            {result.student?.niveauScolaire || "Niveau"}
                          </p>
                          <p className="text-xs font-semibold text-slate-400">
                            {result.student?.classe || "Classe"}
                          </p>
                        </td>

                        <td className="px-6 py-4 align-middle text-slate-600">
                          <div className="flex items-start gap-2">
                            <BookOpen
                              size={16}
                              className="mt-1 shrink-0 text-violet-500"
                            />
                            <span className="line-clamp-2 font-medium leading-6">
                              {result.course?.titre || "Cours"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 align-middle text-slate-600">
                          <p className="line-clamp-2 font-semibold leading-6 text-slate-700">
                            {result.quiz?.titre || "Quiz"}
                          </p>

                          {result.quiz?.difficulte && (
                            <span
                              className={`mt-2 inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${
                                difficulteStyle[result.quiz.difficulte]
                              }`}
                            >
                              {difficulteLabel[result.quiz.difficulte]}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <span className="inline-flex whitespace-nowrap rounded-2xl bg-violet-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-violet-600/20">
                            {result.score}%
                          </span>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${
                              niveauStyle[result.niveauDetecte]
                            }`}
                          >
                            {niveauLabel[result.niveauDetecte]}
                          </span>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <span className="inline-flex whitespace-nowrap rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
                            Tentative {result.tentative || 1}
                          </span>
                        </td>

                        <td className="px-6 py-4 align-middle text-slate-500">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <CalendarDays
                              size={16}
                              className="shrink-0 text-slate-400"
                            />
                            {formatDate(result.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-violet-100 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Page {currentPage} sur {totalPages}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-100 bg-white text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    const active = page === currentPage;

                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-black transition ${
                          active
                            ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                            : "border border-violet-100 bg-white text-violet-700 hover:bg-violet-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-100 bg-white text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

export default TeacherResultsPage;