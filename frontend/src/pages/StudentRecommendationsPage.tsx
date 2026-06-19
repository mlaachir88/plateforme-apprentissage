import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Layers,
  Lightbulb,
  ListChecks,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import api from "../api/axios";
import StudentNav from "../components/StudentNav";
import MathContent from "../components/MathContent";

type AnalyseParPartie = {
  partieId: string;
  titre: string;
  totalQuestions: number;
  bonnesReponses: number;
  score: number;
  statut: "maitrise" | "a_renforcer" | "fragile";
};

type CompetenceFaible = {
  competence: string;
  erreurs: number;
};

type Diagnostic = {
  partieFaible: string;
  analyseParPartie: AnalyseParPartie[];
  competencesFaibles: CompetenceFaible[];
  commentaire: string;
  recommandation: string;
  ai?: {
    synthese?: string;
    competences?: string;
    source?: "openai" | "fallback";
    errorCode?: string;
  };
};

type Course = {
  _id: string;
  titre: string;
  matiere: string;
  niveau: string;
};

type Recommendation = {
  _id: string;
  titre: string;
  description: string;
  type: "practice";
  partieId: string;
  questions: {
    _id: string;
    question: string;
    choix: string[];
    partieId?: string;
    competence?: string;
  }[];
};

type LastResult = {
  score: number;
  bonnesReponses: number;
  totalQuestions: number;
  createdAt: string;
};

type RecommendationsResponse = {
  message: string;
  niveauDetecte: "weak" | "medium" | "strong" | null;
  diagnostic: Diagnostic | null;
  course?: Course;
  lastResult?: LastResult;
  recommendations: Recommendation[];
};

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

const statutLabel = {
  maitrise: "Maîtrisé",
  a_renforcer: "À renforcer",
  fragile: "Fragile",
};

const statutStyle = {
  maitrise: "border-emerald-100 bg-emerald-50 text-emerald-700",
  a_renforcer: "border-amber-100 bg-amber-50 text-amber-700",
  fragile: "border-rose-100 bg-rose-50 text-rose-700",
};

const competenceLabel: Record<string, string> = {
  comprehension: "Compréhension de la consigne",
  calcul: "Calcul",
  resolution_equation: "Résolution d’équation",
  application_regle: "Application d’une règle",
  raisonnement: "Raisonnement mathématique",
  autre: "Autre",
};

const formatDate = (date?: string) => {
  if (!date) {
    return "Non disponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

function StudentRecommendationsPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get("/results/recommendations/me");
        setData(response.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement des recommandations"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchRecommendations();
  }, []);

  const priorityParts = useMemo(() => {
    return (
      data?.diagnostic?.analyseParPartie
        .filter((partie) => partie.statut !== "maitrise")
        .sort((a, b) => a.score - b.score) || []
    );
  }, [data]);

  const masteredParts = useMemo(() => {
    return (
      data?.diagnostic?.analyseParPartie.filter(
        (partie) => partie.statut === "maitrise"
      ).length || 0
    );
  }, [data]);

  const globalScore = data?.lastResult?.score ?? 0;

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
                <BrainCircuit size={16} />
                Plan de progression IA
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                Mes recommandations personnalisées
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Votre plan est généré à partir de vos résultats, des parties
                fragiles et des compétences à renforcer. L’objectif est simple :
                savoir quoi retravailler en priorité.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/etudiant")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                >
                  <ArrowLeft size={17} />
                  Retour aux cours
                </button>

                <button
                  onClick={() => navigate("/etudiant/resultats")}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                >
                  Voir mes résultats
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
                      Dernier score
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : `${globalScore}%`}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm">
                    <Trophy size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-fuchsia-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-fuchsia-700">
                      Exercices proposés
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : data?.recommendations.length ?? 0}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 shadow-sm">
                    <ListChecks size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-amber-700">
                      Priorités
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : priorityParts.length}
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
                  Chargement des recommandations...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous préparons votre plan de progression.
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

        {!chargement && !erreur && data && !data.diagnostic && (
          <section className="rounded-[2.3rem] border border-violet-100 bg-white/95 p-10 text-center shadow-xl shadow-violet-100/40 backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-violet-50 text-violet-600 shadow-sm">
              <ListChecks size={40} />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Aucun diagnostic disponible
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              Passez d’abord un quiz diagnostique pour recevoir des exercices
              adaptés à vos difficultés.
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

        {!chargement && !erreur && data && data.diagnostic && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <BookOpen size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      Cours analysé
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Le plan ci-dessous est basé sur votre dernier résultat.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-[1.7rem] border border-violet-100 bg-violet-50/60 p-5">
                    <p className="text-sm font-bold text-violet-700">Cours</p>
                    <p className="mt-2 font-bold text-slate-950">
                      {data.course?.titre || "Cours"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {data.course?.matiere} · {data.course?.niveau}
                    </p>
                  </div>

                  <div className="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-700">
                      Dernier résultat
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">
                      {data.lastResult?.score ?? 0}%
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {data.lastResult?.bonnesReponses ?? 0}/
                      {data.lastResult?.totalQuestions ?? 0} bonne(s) réponse(s)
                    </p>
                  </div>

                  <div className="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-700">
                      Niveau détecté
                    </p>

                    {data.niveauDetecte ? (
                      <span
                        className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${
                          niveauStyle[data.niveauDetecte]
                        }`}
                      >
                        {niveauLabel[data.niveauDetecte]}
                      </span>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        Non détecté
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <BrainCircuit size={24} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                        Diagnostic adaptatif IA
                      </h2>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                          data.diagnostic.ai?.source === "openai"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Sparkles size={13} />
                        {data.diagnostic.ai?.source === "openai"
                          ? "Généré par IA"
                          : "Analyse automatique"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Partie faible, recommandation et synthèse personnalisée.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-[1.7rem] border border-violet-100 bg-violet-50/60 p-5">
                    <p className="text-sm font-bold text-violet-700">
                      Partie prioritaire
                    </p>

                    <p className="mt-2 text-lg font-bold text-slate-950">
                      {data.diagnostic.partieFaible || "Non détectée"}
                    </p>
                  </div>

                  <div className="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-700">
                      Recommandation
                    </p>

                    <div className="mt-2 text-sm leading-6 text-slate-600">
                      <MathContent content={data.diagnostic.recommandation} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-sm font-bold text-slate-950">
                    Commentaire pédagogique
                  </p>

                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    <MathContent content={data.diagnostic.commentaire} />
                  </div>
                </div>

                {data.diagnostic.ai?.synthese && (
                  <div className="mt-5 rounded-[1.7rem] border border-violet-100 bg-violet-50/60 p-5">
                    <p className="flex items-center gap-2 text-sm font-bold text-violet-900">
                      <Sparkles size={16} />
                      Synthèse IA
                    </p>

                    <div className="mt-2 text-sm leading-6 text-violet-800">
                      <MathContent content={data.diagnostic.ai.synthese} />
                    </div>
                  </div>
                )}

                {data.diagnostic.ai?.competences && (
                  <div className="mt-5 rounded-[1.7rem] border border-fuchsia-100 bg-fuchsia-50/60 p-5">
                    <p className="flex items-center gap-2 text-sm font-bold text-fuchsia-900">
                      <Target size={16} />
                      Compétences ciblées par l’IA
                    </p>

                    <div className="mt-2 text-sm leading-6 text-fuchsia-800">
                      <MathContent content={data.diagnostic.ai.competences} />
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Target size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      Résultat par partie
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Les parties fragiles sont vos priorités de révision.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {data.diagnostic.analyseParPartie.map((partie) => (
                    <div
                      key={partie.partieId}
                      className="rounded-[1.7rem] border border-slate-100 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-bold text-slate-950">
                            {partie.titre}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {partie.bonnesReponses}/{partie.totalQuestions}{" "}
                            bonne(s) réponse(s)
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${
                              statutStyle[partie.statut]
                            }`}
                          >
                            {statutLabel[partie.statut]}
                          </span>

                          <span className="text-xl font-bold text-slate-950">
                            {partie.score}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-violet-600"
                          style={{ width: `${partie.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {data.diagnostic.competencesFaibles.length > 0 && (
                <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                      <Lightbulb size={24} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                        Compétences à renforcer
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Ces compétences reviennent dans vos erreurs.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {data.diagnostic.competencesFaibles.map((item) => (
                      <span
                        key={item.competence}
                        className="rounded-full border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700"
                      >
                        {competenceLabel[item.competence] || item.competence} ·{" "}
                        {item.erreurs} erreur(s)
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Layers size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      Exercices recommandés
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Ces entraînements correspondent aux parties à renforcer.
                    </p>
                  </div>
                </div>

                {data.recommendations.length === 0 ? (
                  <div className="mt-6 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-6 text-sm text-slate-500">
                    Aucun exercice recommandé pour le moment.
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    {data.recommendations.map((quiz) => (
                      <article
                        key={quiz._id}
                        className="rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              Exercice d’entraînement
                            </span>

                            <h3 className="mt-3 text-lg font-bold text-slate-950">
                              {quiz.titre}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {quiz.description}
                            </p>
                          </div>

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <ListChecks size={23} />
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-xs font-semibold text-slate-500">
                            Questions
                          </p>
                          <p className="mt-1 font-bold text-slate-950">
                            {quiz.questions.length} question(s)
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/etudiant/quiz/${quiz._id}`)}
                          className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                        >
                          Commencer l’entraînement
                          <PlayCircle
                            size={18}
                            className="transition group-hover:translate-x-0.5"
                          />
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
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
                        Résumé du plan
                      </h3>
                      <p className="text-sm text-slate-500">
                        Priorités actuelles.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                      <p className="text-xs font-bold text-violet-700">
                        Score récent
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {data.lastResult?.score ?? 0}%
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Le {formatDate(data.lastResult?.createdAt)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs font-bold text-amber-700">
                        Parties à revoir
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {priorityParts.length}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-bold text-emerald-700">
                        Parties maîtrisées
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {masteredParts}
                      </p>
                    </div>
                  </div>
                </div>

                {priorityParts.length > 0 && (
                  <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <Target size={22} />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-950">
                          Priorité n°1
                        </h3>
                        <p className="text-sm text-slate-500">
                          À travailler en premier.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="font-bold text-slate-950">
                        {priorityParts[0].titre}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Score actuel :{" "}
                        <span className="font-bold">
                          {priorityParts[0].score}%
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        Prochaine étape
                      </h3>
                      <p className="text-sm text-slate-500">
                        Continuer simplement.
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Commencez par l’exercice recommandé le plus proche de votre
                    partie faible, puis refaites un quiz pour mesurer vos progrès.
                  </p>

                  <button
                    onClick={() => navigate("/etudiant")}
                    className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                  >
                    Retour aux cours
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
      </main>
    </div>
  );
}

export default StudentRecommendationsPage;