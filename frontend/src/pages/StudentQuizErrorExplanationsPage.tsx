import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
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
                Explication IA des erreurs
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                Comprendre mes erreurs
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                L’IA analyse vos mauvaises réponses, compare votre choix avec
                la bonne réponse et vous explique la méthode à utiliser pour
                progresser.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                >
                  <ArrowLeft size={17} />
                  Retour
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
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[2rem] border border-rose-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-rose-700">
                      Erreurs détectées
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : data?.totalErrors ?? 0}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm">
                    <Target size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-violet-700">Source</p>
                    <p className="mt-2 text-lg font-bold tracking-tight text-slate-950">
                      {chargement
                        ? "..."
                        : data?.source === "openai"
                          ? "IA OpenAI"
                          : data?.source === "fallback"
                            ? "Automatique"
                            : "Aucune"}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm">
                    <Sparkles size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-amber-700">
                      Objectif
                    </p>
                    <p className="mt-2 text-lg font-bold tracking-tight text-slate-950">
                      Progresser
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
                    <Lightbulb size={24} />
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
                  Génération des explications IA...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous analysons vos réponses et préparons les explications.
                </p>
              </div>
            </div>
          </section>
        )}

        {!chargement && erreur && (
          <section className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 shrink-0" size={22} />

              <div>
                <p className="font-bold">
                  Impossible d’afficher les explications
                </p>
                <p className="mt-2 text-sm leading-6">{erreur}</p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("/etudiant")}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
                  >
                    <ArrowLeft size={17} />
                    Retour à mes cours
                  </button>

                  {quizId && (
                    <button
                      onClick={() => navigate(`/etudiant/quiz/${quizId}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                    >
                      <RotateCcw size={17} />
                      Repasser le quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {!chargement && !erreur && data && data.explanations.length === 0 && (
          <section className="rounded-[2.3rem] border border-emerald-100 bg-white/95 p-10 text-center shadow-xl shadow-emerald-100/40 backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-emerald-50 text-emerald-600 shadow-sm">
              <CheckCircle2 size={40} />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Aucune erreur à expliquer
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              Bravo, toutes vos réponses sont correctes. Vous pouvez continuer
              votre progression ou consulter vos recommandations.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/etudiant")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-100 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                <ArrowLeft size={17} />
                Retour à mes cours
              </button>

              <button
                onClick={() => navigate("/etudiant/recommandations")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Recommandations
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        {!chargement && !erreur && data && data.explanations.length > 0 && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <BrainCircuit size={24} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                        Explications détaillées
                      </h2>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                          data.source === "openai"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Sparkles size={13} />
                        {data.source === "openai"
                          ? "Généré par IA"
                          : "Analyse automatique"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Chaque erreur est expliquée avec la bonne réponse et la
                      méthode à appliquer.
                    </p>
                  </div>
                </div>
              </div>

              {data.explanations.map((item, index) => (
                <article
                  key={`${item.index}-${index}`}
                  className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/25 backdrop-blur-xl md:p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700">
                        <XCircle size={16} />
                        Question {item.index + 1}
                      </div>

                      <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950">
                        Question analysée
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.partie && (
                        <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                          {item.partie}
                        </span>
                      )}

                      <span className="rounded-full border border-fuchsia-100 bg-fuchsia-50 px-3 py-1.5 text-xs font-bold text-fuchsia-700">
                        {competenceLabel[item.competence] || item.competence}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5 text-sm text-slate-700">
                    <MathContent content={item.question} />
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-[1.7rem] border border-rose-100 bg-rose-50 p-5">
                      <p className="flex items-center gap-2 text-sm font-bold text-rose-800">
                        <XCircle size={16} />
                        Votre réponse
                      </p>

                      <div className="mt-3 text-sm leading-6 text-rose-700">
                        <MathContent content={item.studentAnswer} />
                      </div>
                    </div>

                    <div className="rounded-[1.7rem] border border-emerald-100 bg-emerald-50 p-5">
                      <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                        <CheckCircle2 size={16} />
                        Bonne réponse
                      </p>

                      <div className="mt-3 text-sm leading-6 text-emerald-700">
                        <MathContent content={item.correctAnswer} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.7rem] border border-violet-100 bg-violet-50/60 p-5">
                    <p className="flex items-center gap-2 text-sm font-bold text-violet-900">
                      <Sparkles size={16} />
                      Explication IA
                    </p>

                    <div className="mt-3 text-sm leading-7 text-violet-800">
                      <MathContent content={item.explanation} />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Lightbulb size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Résumé de correction
                    </h3>
                    <p className="text-sm text-slate-500">Points à revoir.</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                    <p className="text-xs font-bold text-rose-700">Erreurs</p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">
                      {data.totalErrors}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                    <p className="text-xs font-bold text-violet-700">Source</p>
                    <p className="mt-1 font-bold text-slate-950">
                      {data.source === "openai"
                        ? "Généré par IA"
                        : "Analyse automatique"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-xs font-bold text-amber-700">Conseil</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      Relisez chaque correction puis refaites un entraînement
                      ciblé.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {quizId && (
                    <button
                      onClick={() => navigate(`/etudiant/quiz/${quizId}`)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
                    >
                      <RotateCcw size={17} />
                      Refaire le quiz
                    </button>
                  )}

                  <button
                    onClick={() => navigate("/etudiant/recommandations")}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
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
      </main>
    </div>
  );
}

export default StudentQuizErrorExplanationsPage;