import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";

import api from "../api/axios";
import StudentNav from "../components/StudentNav";
import MathContent from "../components/MathContent";

type ErrorExplanation = {
  index: number;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  competence: string;
  partie: string;
  explanation: string;
};

type ExplainErrorsResponse = {
  message: string;
  source: "openai" | "fallback" | "none";
  errorCode?: string;
  totalErrors: number;
  explanations: ErrorExplanation[];
};

const competenceLabel: Record<string, string> = {
  comprehension: "Compréhension",
  calcul: "Calcul",
  resolution_equation: "Résolution d’équation",
  application_regle: "Application d’une règle",
  raisonnement: "Raisonnement",
  autre: "Autre",
};

function StudentQuizErrorExplanationsPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [data, setData] = useState<ExplainErrorsResponse | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchExplanations = async () => {
      try {
        if (!quizId) {
          setErreur("Quiz introuvable");
          return;
        }

        const savedAnswers = sessionStorage.getItem(`quiz_answers_${quizId}`);

        if (!savedAnswers) {
          setErreur(
            "Impossible de retrouver vos réponses. Veuillez repasser le quiz pour générer les explications."
          );
          return;
        }

        const answers = JSON.parse(savedAnswers);

        const response = await api.post(`/quizzes/${quizId}/explain-errors`, {
          answers,
        });

        setData(response.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors de la génération des explications IA"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchExplanations();
  }, [quizId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 px-8 py-10 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.35),transparent_35%)]" />

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  <BrainCircuit size={16} />
                  Explication IA des erreurs
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
                  Comprendre mes erreurs
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">
                  L’IA analyse vos mauvaises réponses et explique la méthode à
                  utiliser pour progresser.
                </p>
              </div>

              <button
                onClick={() => navigate(-1)}
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
            Génération des explications IA en cours...
          </div>
        )}

        {!chargement && erreur && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 shrink-0" size={22} />

              <div>
                <p className="font-semibold">Impossible d’afficher les explications</p>
                <p className="mt-2 text-sm leading-6">{erreur}</p>

                <button
                  onClick={() => navigate("/etudiant")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  <ArrowLeft size={17} />
                  Retour à mes cours
                </button>
              </div>
            </div>
          </div>
        )}

        {!chargement && !erreur && data && data.explanations.length === 0 && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-600">
              <CheckCircle2 size={34} />
            </div>

            <h2 className="text-xl font-bold text-emerald-900">
              Aucune erreur à expliquer
            </h2>

            <p className="mt-2 text-sm text-emerald-700">
              Bravo, toutes vos réponses sont correctes.
            </p>

            <button
              onClick={() => navigate("/etudiant")}
              className="mt-6 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Retour à mes cours
            </button>
          </div>
        )}

        {!chargement && !erreur && data && data.explanations.length > 0 && (
          <div className="space-y-6">
            <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-rose-700">
                  <Target size={18} />
                  Erreurs détectées
                </div>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {data.totalErrors}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
                  <Sparkles size={18} />
                  Source
                </div>

                <span
                  className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                    data.source === "openai"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {data.source === "openai"
                    ? "Généré par IA"
                    : "Analyse automatique"}
                </span>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Lightbulb size={18} />
                  Objectif
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Comprendre la méthode correcte pour éviter de refaire les
                  mêmes erreurs.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <BrainCircuit size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Explications détaillées
                  </h2>

                  <p className="text-sm text-slate-500">
                    Chaque erreur est expliquée avec une méthode de correction.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {data.explanations.map((item, index) => (
                  <article
                    key={`${item.index}-${index}`}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                          Question {item.index + 1}
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-slate-900">
                          Question
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {item.partie}
                        </span>

                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                          {competenceLabel[item.competence] || item.competence}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
                      <MathContent content={item.question} />
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
                        <p className="text-sm font-semibold text-rose-800">
                          Votre réponse
                        </p>

                        <div className="mt-2 text-sm text-rose-700">
                          <MathContent content={item.studentAnswer} />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <p className="text-sm font-semibold text-emerald-800">
                          Bonne réponse
                        </p>

                        <div className="mt-2 text-sm text-emerald-700">
                          <MathContent content={item.correctAnswer} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                      <p className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                        <Sparkles size={16} />
                        Explication IA
                      </p>

                      <p className="mt-2 text-sm leading-7 text-indigo-800">
                        {item.explanation}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentQuizErrorExplanationsPage;