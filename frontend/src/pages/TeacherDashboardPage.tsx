import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  ClipboardList,
  Clock3,
  GraduationCap,
  Layers,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import api from "../api/axios";
import TeacherNav from "../components/TeacherNav";

type StudentProfile = {
  avatarUrl?: string;
  avatarPublicId?: string;
};

type LatestResult = {
  _id: string;
  score: number;
  niveauDetecte: string;
  tentative: number;
  student?: {
    prenom: string;
    nom: string;
    email: string;
    niveauScolaire: string;
    classe: string;
    profile?: StudentProfile;
  };
  quiz?: {
    titre: string;
    difficulte: string;
  };
  course?: {
    titre: string;
    matiere: string;
  };
};

type DashboardData = {
  coursesCount: number;
  quizzesCount: number;
  studentsCount: number;
  resultsCount: number;
  averageScore: number;
  latestResults: LatestResult[];
};

const niveauLabel: Record<string, string> = {
  weak: "À renforcer",
  medium: "Moyen",
  strong: "Solide",
};

const niveauStyle: Record<string, string> = {
  weak: "border-rose-100 bg-rose-50 text-rose-700",
  medium: "border-amber-100 bg-amber-50 text-amber-700",
  strong: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

const getStudentInitials = (student?: LatestResult["student"]) => {
  const first = student?.prenom?.trim()?.[0] || "";
  const last = student?.nom?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || "E";
};

const StudentAvatar = ({ student }: { student?: LatestResult["student"] }) => {
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
        className="h-12 w-12 shrink-0 rounded-full object-cover ring-4 ring-violet-100"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-black text-violet-700 ring-4 ring-violet-100">
      {getStudentInitials(student)}
    </div>
  );
};

function TeacherDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/teacher");
        setData(response.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement du tableau de bord"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchDashboard();
  }, []);

  const bestRecentScore = useMemo(() => {
    if (!data || data.latestResults.length === 0) {
      return 0;
    }

    return Math.max(...data.latestResults.map((result) => result.score));
  }, [data]);

  const weakResultsCount = useMemo(() => {
    if (!data) {
      return 0;
    }

    return data.latestResults.filter(
      (result) => result.niveauDetecte === "weak"
    ).length;
  }, [data]);

  const stats = data
    ? [
        {
          label: "Cours",
          value: data.coursesCount,
          icon: BookOpen,
          color: "text-violet-600",
          bg: "bg-violet-50",
          border: "border-violet-100",
        },
        {
          label: "Quiz",
          value: data.quizzesCount,
          icon: ClipboardList,
          color: "text-fuchsia-600",
          bg: "bg-fuchsia-50",
          border: "border-fuchsia-100",
        },
        {
          label: "Étudiants",
          value: data.studentsCount,
          icon: Users,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
        },
        {
          label: "Résultats",
          value: data.resultsCount,
          icon: BarChart3,
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-100",
        },
      ]
    : [];

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
                <Sparkles size={16} />
                Tableau de bord professeur
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                Pilotez vos cours, quiz et résultats.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Suivez l’activité des étudiants, consultez les derniers
                résultats, créez des contenus et préparez vos actions
                pédagogiques depuis un seul espace.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/professeur/cours/nouveau"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                >
                  <PlusCircle size={18} />
                  Créer un cours
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  to="/professeur/quiz/nouveau"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                >
                  <ClipboardList size={18} />
                  Créer un quiz
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-violet-700">
                      Moyenne classe
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : `${data?.averageScore ?? 0}%`}
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
                      Meilleur récent
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : `${bestRecentScore}%`}
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
                      À accompagner
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : weakResultsCount}
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

        <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Link
            to="/professeur/cours/nouveau"
            className="group rounded-[1.7rem] border border-violet-100 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/50"
          >
            <PlusCircle className="text-violet-600" size={24} />
            <p className="mt-4 font-bold text-slate-950">Créer un cours</p>
            <p className="mt-1 text-sm text-slate-500">Ajouter un contenu.</p>
          </Link>

          <Link
            to="/professeur/quiz/nouveau"
            className="group rounded-[1.7rem] border border-fuchsia-100 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-100/50"
          >
            <ClipboardList className="text-fuchsia-600" size={24} />
            <p className="mt-4 font-bold text-slate-950">Créer un quiz</p>
            <p className="mt-1 text-sm text-slate-500">Préparer un test.</p>
          </Link>

          <Link
            to="/professeur/cours/acces"
            className="group rounded-[1.7rem] border border-emerald-100 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-100/50"
          >
            <ShieldCheck className="text-emerald-600" size={24} />
            <p className="mt-4 font-bold text-slate-950">Donner accès</p>
            <p className="mt-1 text-sm text-slate-500">Gérer les élèves.</p>
          </Link>

          <Link
            to="/professeur/resultats"
            className="group rounded-[1.7rem] border border-amber-100 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-100/50"
          >
            <BarChart3 className="text-amber-600" size={24} />
            <p className="mt-4 font-bold text-slate-950">Résultats</p>
            <p className="mt-1 text-sm text-slate-500">Suivre les scores.</p>
          </Link>

          <Link
            to="/professeur/cours"
            className="group rounded-[1.7rem] border border-violet-100 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/50"
          >
            <BookOpen className="text-violet-600" size={24} />
            <p className="mt-4 font-bold text-slate-950">Mes cours</p>
            <p className="mt-1 text-sm text-slate-500">Organiser.</p>
          </Link>

          <Link
            to="/professeur/quiz"
            className="group rounded-[1.7rem] border border-fuchsia-100 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-100/50"
          >
            <Layers className="text-fuchsia-600" size={24} />
            <p className="mt-4 font-bold text-slate-950">Mes quiz</p>
            <p className="mt-1 text-sm text-slate-500">Modifier.</p>
          </Link>
        </section>

        {chargement && (
          <section className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Clock3 size={23} />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Chargement du tableau de bord...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous récupérons vos indicateurs professeur.
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

        {!chargement && !erreur && data && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className={`rounded-[2rem] border ${stat.border} bg-white/95 p-5 shadow-lg shadow-violet-100/20 backdrop-blur-xl`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}
                      >
                        <Icon size={24} />
                      </div>

                      <p className="mt-5 text-sm font-bold text-slate-500">
                        {stat.label}
                      </p>

                      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="overflow-hidden rounded-[2.2rem] border border-violet-100 bg-white/95 shadow-xl shadow-violet-100/30 backdrop-blur-xl">
                <div className="flex flex-col gap-4 border-b border-violet-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <BrainCircuit size={24} />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-slate-950">
                        Derniers résultats
                      </h3>

                      <p className="text-sm text-slate-500">
                        Activité récente des étudiants.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/professeur/resultats"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2.5 text-sm font-bold text-violet-700 shadow-sm transition hover:bg-violet-50"
                  >
                    Tout voir
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {data.latestResults.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <ClipboardList size={32} />
                    </div>

                    <p className="font-bold text-slate-950">
                      Aucun résultat pour le moment
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Les résultats apparaîtront ici après les premiers quiz.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.latestResults.map((result) => {
                      const niveau =
                        niveauLabel[result.niveauDetecte] ||
                        result.niveauDetecte ||
                        "Non détecté";

                      const niveauClass =
                        niveauStyle[result.niveauDetecte] ||
                        "border-slate-100 bg-slate-50 text-slate-600";

                      return (
                        <article
                          key={result._id}
                          className="flex flex-col gap-4 px-6 py-5 transition hover:bg-violet-50/35 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="flex min-w-0 items-start gap-4">
                            <StudentAvatar student={result.student} />

                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-950">
                                {result.student?.prenom || "Étudiant"}{" "}
                                {result.student?.nom || ""}
                              </p>

                              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                {result.course?.titre || "Cours"} ·{" "}
                                {result.quiz?.titre || "Quiz"}
                              </p>

                              <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                                {result.student?.classe ||
                                  result.student?.niveauScolaire ||
                                  "Classe non indiquée"}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 md:justify-end">
                            <span className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-violet-600/20">
                              {result.score}%
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${niveauClass}`}
                            >
                              {niveau}
                            </span>

                            <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
                              Tentative {result.tentative || 1}
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
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
                    <Link
                      to="/professeur/cours"
                      className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      Mes cours
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      to="/professeur/quiz"
                      className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      Mes quiz
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      to="/professeur/resultats"
                      className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      Analyse des résultats
                      <ArrowRight size={16} />
                    </Link>
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

export default TeacherDashboardPage;