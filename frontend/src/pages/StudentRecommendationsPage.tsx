import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Layers,
  ListChecks,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";

import api from "../api/axios";
import StudentNav from "../components/StudentNav";

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
  weak: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  strong: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statutLabel = {
  maitrise: "Maîtrisé",
  a_renforcer: "À renforcer",
  fragile: "Fragile",
};

const statutStyle = {
  maitrise: "bg-emerald-50 text-emerald-700 border-emerald-200",
  a_renforcer: "bg-amber-50 text-amber-700 border-amber-200",
  fragile: "bg-rose-50 text-rose-700 border-rose-200",
};

const competenceLabel: Record<string, string> = {
  comprehension: "Compréhension de la consigne",
  calcul: "Calcul",
  resolution_equation: "Résolution d’équation",
  application_regle: "Application d’une règle",
  raisonnement: "Raisonnement mathématique",
  autre: "Autre",
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

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-10 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.35),transparent_35%)]" />

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  <BrainCircuit size={16} />
                  Apprentissage adaptatif IA
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
                  Mes recommandations
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">
                  Exercices proposés selon vos résultats, vos parties faibles et
                  l’analyse pédagogique personnalisée.
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
        </section>

        {chargement && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
            Chargement des recommandations...
          </div>
        )}

        {erreur && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {erreur}
          </div>
        )}

        {!chargement && !erreur && data && !data.diagnostic && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ListChecks size={32} />
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Aucun diagnostic disponible
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Passez d’abord un quiz diagnostique pour recevoir des exercices
              adaptés.
            </p>

            <button
              onClick={() => navigate("/etudiant")}
              className="mt-6 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Voir mes cours
            </button>
          </div>
        )}

        {!chargement && !erreur && data && data.diagnostic && (
          <div className="space-y-6">
            <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                  <BookOpen size={18} />
                  Cours
                </div>

                <p className="mt-3 text-lg font-bold text-slate-900">
                  {data.course?.titre || "Cours"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {data.course?.matiere} · {data.course?.niveau}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <CheckCircle2 size={18} />
                  Dernier score
                </div>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {data.lastResult?.score ?? 0}%
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {data.lastResult?.bonnesReponses ?? 0}/
                  {data.lastResult?.totalQuestions ?? 0} bonne(s) réponse(s)
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Target size={18} />
                  Niveau détecté
                </div>

                {data.niveauDetecte ? (
                  <span
                    className={`mt-4 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${
                      niveauStyle[data.niveauDetecte]
                    }`}
                  >
                    {niveauLabel[data.niveauDetecte]}
                  </span>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">Non détecté</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BrainCircuit size={24} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      Diagnostic adaptatif IA
                    </h2>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
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

                  <p className="text-sm text-slate-500">
                    Partie faible, recommandation et synthèse personnalisée.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <p className="text-sm font-semibold text-blue-700">
                    Partie prioritaire
                  </p>

                  <p className="mt-2 text-lg font-bold text-blue-900">
                    {data.diagnostic.partieFaible || "Non détectée"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-700">
                    Recommandation
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {data.diagnostic.recommandation}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  Commentaire pédagogique
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {data.diagnostic.commentaire}
                </p>
              </div>

              {data.diagnostic.ai?.synthese && (
                <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                    <Sparkles size={16} />
                    Synthèse IA
                  </p>

                  <p className="mt-2 text-sm leading-6 text-indigo-800">
                    {data.diagnostic.ai.synthese}
                  </p>
                </div>
              )}

              {data.diagnostic.ai?.competences && (
                <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-violet-900">
                    <Target size={16} />
                    Compétences ciblées par l’IA
                  </p>

                  <p className="mt-2 text-sm leading-6 text-violet-800">
                    {data.diagnostic.ai.competences}
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Résultat par partie
              </h2>

              <div className="mt-5 space-y-3">
                {data.diagnostic.analyseParPartie.map((partie) => (
                  <div
                    key={partie.partieId}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {partie.titre}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {partie.bonnesReponses}/{partie.totalQuestions} bonne(s)
                          réponse(s)
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            statutStyle[partie.statut]
                          }`}
                        >
                          {statutLabel[partie.statut]}
                        </span>

                        <span className="text-xl font-bold text-slate-900">
                          {partie.score}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${partie.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {data.diagnostic.competencesFaibles.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">
                  Compétences à renforcer
                </h2>

                <div className="mt-5 flex flex-wrap gap-2">
                  {data.diagnostic.competencesFaibles.map((item) => (
                    <span
                      key={item.competence}
                      className="rounded-full bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
                    >
                      {competenceLabel[item.competence] || item.competence} ·{" "}
                      {item.erreurs} erreur(s)
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Layers size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Exercices recommandés
                  </h2>

                  <p className="text-sm text-slate-500">
                    Ces entraînements correspondent aux parties à renforcer.
                  </p>
                </div>
              </div>

              {data.recommendations.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                  Aucun exercice recommandé pour le moment.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {data.recommendations.map((quiz) => (
                    <article
                      key={quiz._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Exercice d’entraînement
                          </span>

                          <h3 className="mt-3 text-lg font-bold text-slate-900">
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

                      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Questions</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {quiz.questions.length} question(s)
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(`/etudiant/quiz/${quiz._id}`)}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Commencer l’entraînement
                        <PlayCircle size={18} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentRecommendationsPage;