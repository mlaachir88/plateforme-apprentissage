import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  GraduationCap,
  Medal,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import api from "../api/axios";
import StudentNav from "../components/StudentNav";

type StoredUser = {
  id?: string;
  nom?: string;
  name?: string;
  prenom?: string;
  email?: string;
  role?: string;
  niveauScolaire?: string;
  classe?: string;
  profile?: {
    avatarUrl?: string;
    avatarPublicId?: string;
  };
};

type StudentResult = {
  _id: string;
  score: number;
  niveauDetecte: "weak" | "medium" | "strong";
  bonnesReponses: number;
  totalQuestions: number;
  tentative?: number;
  createdAt: string;
  updatedAt: string;
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

const niveauLabel = {
  weak: "À renforcer",
  medium: "Moyen",
  strong: "Solide",
};

const difficulteLabel = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

const niveauStyle = {
  weak: "border-rose-100 bg-rose-50 text-rose-700",
  medium: "border-amber-100 bg-amber-50 text-amber-700",
  strong: "border-emerald-100 bg-emerald-50 text-emerald-700",
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

const getStoredUser = (): StoredUser | null => {
  try {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      return null;
    }

    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const getInitials = (user: StoredUser | null) => {
  const first = user?.prenom?.trim()?.[0] || "";
  const last = user?.nom?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || "E";
};

function StudentResultsPage() {
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement | null>(null);

  const [results, setResults] = useState<StudentResult[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [currentUser] = useState<StoredUser | null>(getStoredUser());

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get("/results/me");
        setResults(response.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement de vos résultats"
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

  const averageScore = useMemo(() => {
    if (results.length === 0) {
      return 0;
    }

    const total = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / results.length);
  }, [results]);

  const bestScore = useMemo(() => {
    if (results.length === 0) {
      return 0;
    }

    return Math.max(...results.map((result) => result.score));
  }, [results]);

  const totalGoodAnswers = useMemo(() => {
    return results.reduce((sum, result) => sum + result.bonnesReponses, 0);
  }, [results]);

  const totalQuestions = useMemo(() => {
    return results.reduce((sum, result) => sum + result.totalQuestions, 0);
  }, [results]);

  const strongResults = results.filter(
    (result) => result.niveauDetecte === "strong"
  ).length;


  const displayName =
    currentUser?.prenom && currentUser?.nom
      ? `${currentUser.prenom} ${currentUser.nom}`
      : currentUser?.nom || currentUser?.name || "Étudiant";

  const handleDownloadPdf = async () => {
    if (!pdfRef.current || results.length === 0) {
      return;
    }

    setPdfLoading(true);

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeName = displayName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      pdf.save(`bilan-resultats-${safeName || "etudiant"}.pdf`);
    } finally {
      setPdfLoading(false);
    }
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
        <section className="mb-6 rounded-[2.4rem] border border-violet-100 bg-white/90 p-6 shadow-xl shadow-violet-100/40 backdrop-blur-2xl md:p-8">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                <Trophy size={16} />
                Bulletin étudiant
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                Mes résultats et ma progression
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Retrouvez l’historique de vos quiz, vos scores, votre niveau
                détecté et les recommandations associées à votre progression.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/etudiant")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                >
                  <BookOpen size={17} />
                  Retour aux cours
                </button>

                <button
                  onClick={() => navigate("/etudiant/recommandations")}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                >
                  Voir mes recommandations
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-0.5"
                  />
                </button>

                {results.length > 0 && (
                  <button
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <Download size={17} />
                    {pdfLoading ? "Préparation..." : "Télécharger mon bilan PDF"}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-violet-700">
                      Moyenne globale
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

              <div className="rounded-[2rem] border border-fuchsia-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-fuchsia-700">
                      Meilleur score
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : `${bestScore}%`}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 shadow-sm">
                    <Medal size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-amber-700">
                      Quiz terminés
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : results.length}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
                    <CheckCircle2 size={24} />
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
                  Chargement de vos résultats...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous récupérons votre historique de quiz.
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
              <Trophy size={40} />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Aucun résultat disponible
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              Vos résultats apparaîtront ici après avoir terminé un quiz.
              Commencez par choisir un cours, puis lancez un diagnostic ou un
              entraînement.
            </p>

            <button
              onClick={() => navigate("/etudiant")}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              Voir mes cours
              <ArrowRight size={17} />
            </button>
          </section>
        )}

        {!chargement && !erreur && results.length > 0 && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Sparkles size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      Historique des quiz
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Les résultats sont classés du plus récent au plus ancien.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {sortedResults.map((result) => {
                  const difficulty = result.quiz?.difficulte;

                  return (
                    <article
                      key={result._id}
                      className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/25 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-100/50 md:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                            <GraduationCap size={14} />
                            {result.course?.matiere || "Matière"} ·{" "}
                            {result.course?.niveau || "Niveau"}
                          </div>

                          <h3 className="mt-4 line-clamp-2 text-xl font-bold tracking-tight text-slate-950">
                            {result.quiz?.titre || "Quiz sans titre"}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            Cours : {result.course?.titre || "Cours inconnu"}
                          </p>
                        </div>

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] bg-violet-600 text-lg font-black text-white shadow-xl shadow-violet-600/20">
                          {result.score}%
                        </div>
                      </div>

                      <div className="mt-5 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-violet-600"
                          style={{ width: `${result.score}%` }}
                        />
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-xs font-semibold text-slate-500">
                            Niveau détecté
                          </p>

                          <span
                            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                              niveauStyle[result.niveauDetecte]
                            }`}
                          >
                            {niveauLabel[result.niveauDetecte]}
                          </span>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-xs font-semibold text-slate-500">
                            Difficulté
                          </p>

                          {difficulty ? (
                            <span
                              className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                                difficulteStyle[difficulty]
                              }`}
                            >
                              {difficulteLabel[difficulty]}
                            </span>
                          ) : (
                            <p className="mt-2 font-bold text-slate-950">
                              Non définie
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-xs font-semibold text-slate-500">
                            Bonnes réponses
                          </p>
                          <p className="mt-1 font-bold text-slate-950">
                            {result.bonnesReponses}/{result.totalQuestions}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-xs font-semibold text-slate-500">
                            Tentative
                          </p>
                          <p className="mt-1 font-bold text-slate-950">
                            {result.tentative || 1}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                        <CalendarDays size={17} />
                        Réalisé le {formatDate(result.createdAt)}
                      </div>

                      <button
                        onClick={() => navigate("/etudiant/recommandations")}
                        className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                      >
                        Voir les recommandations
                        <ArrowRight
                          size={17}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <BarChart3 size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">Synthèse</h3>
                      <p className="text-sm text-slate-500">Vue globale.</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                      <p className="text-xs font-bold text-violet-700">
                        Moyenne
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {averageScore}%
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-bold text-emerald-700">
                        Niveaux solides
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {strongResults}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs font-bold text-amber-700">
                        Réponses correctes
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {totalGoodAnswers}/{totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <Target size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">Conseil</h3>
                      <p className="text-sm text-slate-500">
                        Prochaine étape.
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Consultez vos recommandations pour renforcer les parties où
                    vos résultats sont les plus fragiles.
                  </p>

                  <button
                    onClick={() => navigate("/etudiant/recommandations")}
                    className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                  >
                    Recommandations
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </div>
            </aside>
          </section>
        )}

        <div
          ref={pdfRef}
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: "794px",
            background: "#ffffff",
            color: "#0f172a",
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
          }}
        >
          <div style={{ padding: "48px" }}>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "28px",
                padding: "28px",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "24px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ display: "flex", gap: "18px", minWidth: 0 }}>
                  {currentUser?.profile?.avatarUrl ? (
                    <img
                      src={currentUser.profile.avatarUrl}
                      alt={displayName}
                      crossOrigin="anonymous"
                      style={{
                        width: "78px",
                        height: "78px",
                        borderRadius: "999px",
                        objectFit: "cover",
                        border: "4px solid #ede9fe",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "78px",
                        height: "78px",
                        borderRadius: "999px",
                        background: "#7c3aed",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "26px",
                        fontWeight: 900,
                        border: "4px solid #ede9fe",
                      }}
                    >
                      {getInitials(currentUser)}
                    </div>
                  )}

                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        fontWeight: 900,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#7c3aed",
                      }}
                    >
                      Bilan de progression
                    </p>

                    <h1
                      style={{
                        margin: "8px 0 0",
                        fontSize: "30px",
                        lineHeight: 1.05,
                        letterSpacing: "-0.04em",
                        color: "#020617",
                      }}
                    >
                      {displayName}
                    </h1>

                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: "14px",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      {currentUser?.email || "Compte étudiant"}
                    </p>

                    <p
                      style={{
                        display: "inline-block",
                        margin: "12px 0 0",
                        padding: "7px 12px",
                        borderRadius: "999px",
                        background: "#f8fafc",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#334155",
                      }}
                    >
                      {currentUser?.niveauScolaire || "Niveau"} ·{" "}
                      {currentUser?.classe || "Classe"}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 700,
                    }}
                  >
                    Généré le
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "15px",
                      color: "#020617",
                      fontWeight: 900,
                    }}
                  >
                    {formatDate(new Date().toISOString())}
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginTop: "28px",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "12px",
                }}
              >
                {[
                  ["Moyenne", `${averageScore}%`],
                  ["Meilleur score", `${bestScore}%`],
                  ["Quiz terminés", `${results.length}`],
                  ["Réponses", `${totalGoodAnswers}/${totalQuestions}`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "18px",
                      padding: "16px",
                      background: "#fafafa",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#64748b",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: "24px",
                        fontWeight: 950,
                        color: "#020617",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "24px",
                  borderRadius: "22px",
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: 900,
                    color: "#020617",
                  }}
                >
                  Synthèse pédagogique
                </p>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: "#475569",
                    fontWeight: 500,
                  }}
                >
                  Ce bilan regroupe les derniers résultats de l’étudiant, les
                  scores obtenus, le niveau détecté et l’évolution globale. Les
                  résultats faibles indiquent les notions à reprendre en
                  priorité, tandis que les résultats solides confirment les
                  compétences déjà maîtrisées.
                </p>
              </div>
            </div>

            <div style={{ marginTop: "28px" }}>
              <h2
                style={{
                  margin: "0 0 14px",
                  fontSize: "20px",
                  color: "#020617",
                  letterSpacing: "-0.03em",
                }}
              >
                Historique des résultats
              </h2>

              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "22px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 0.8fr 1.1fr 1fr",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {["Cours", "Quiz", "Score", "Niveau", "Date"].map(
                    (heading) => (
                      <div
                        key={heading}
                        style={{
                          padding: "12px 14px",
                          fontSize: "11px",
                          fontWeight: 900,
                          color: "#475569",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {heading}
                      </div>
                    )
                  )}
                </div>

                {sortedResults.map((result) => (
                  <div
                    key={result._id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 2fr 0.8fr 1.1fr 1fr",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        padding: "13px 14px",
                        fontSize: "12px",
                        color: "#0f172a",
                        fontWeight: 800,
                        lineHeight: 1.45,
                      }}
                    >
                      {result.course?.titre || "Cours"}
                      <div
                        style={{
                          marginTop: "4px",
                          color: "#64748b",
                          fontWeight: 600,
                        }}
                      >
                        {result.course?.matiere || "Matière"}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "13px 14px",
                        fontSize: "12px",
                        color: "#334155",
                        fontWeight: 700,
                        lineHeight: 1.45,
                      }}
                    >
                      {result.quiz?.titre || "Quiz"}
                    </div>

                    <div
                      style={{
                        padding: "13px 14px",
                        fontSize: "13px",
                        color: "#020617",
                        fontWeight: 950,
                      }}
                    >
                      {result.score}%
                    </div>

                    <div
                      style={{
                        padding: "13px 14px",
                        fontSize: "12px",
                        color:
                          result.niveauDetecte === "strong"
                            ? "#047857"
                            : result.niveauDetecte === "medium"
                            ? "#b45309"
                            : "#be123c",
                        fontWeight: 900,
                      }}
                    >
                      {niveauLabel[result.niveauDetecte]}
                    </div>

                    <div
                      style={{
                        padding: "13px 14px",
                        fontSize: "12px",
                        color: "#64748b",
                        fontWeight: 700,
                      }}
                    >
                      {formatDate(result.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: "28px",
                paddingTop: "18px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                color: "#64748b",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              <span>Plateforme IA d’apprentissage adaptatif</span>
              <span>Bilan généré automatiquement</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentResultsPage;