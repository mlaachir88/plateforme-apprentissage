import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  FileQuestion,
  Gauge,
  Layers,
  Lightbulb,
  ListChecks,
  PlayCircle,
  Target,
} from "lucide-react";

import api from "../api/axios";
import StudentNav from "../components/StudentNav";

type RecommendedQuiz = {
  _id: string;
  titre: string;
  description: string;
  difficulte: "easy" | "medium" | "hard";
  course: string;
  questions: {
    _id: string;
    question: string;
    choix: string[];
  }[];
};

type RecommendationResponse = {
  message: string;
  niveauDetecte?: "weak" | "medium" | "strong";
  difficulteRecommandee?: "easy" | "medium" | "hard";
  recommendations: RecommendedQuiz[];
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
  weak: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  strong: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const difficultyStyle = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-rose-50 text-rose-700 border-rose-200",
};

function StudentRecommendationsPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<RecommendationResponse | null>(null);
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

        {!chargement && !erreur && data && (
          <>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-10 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.35),transparent_35%)]" />

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                      <Brain size={16} />
                      Analyse adaptative
                    </div>

                    <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
                      Mes recommandations
                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
                      Les exercices proposés sont générés à partir de votre
                      dernier résultat afin de vous aider à progresser.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/etudiant")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    <ArrowLeft size={17} />
                    Retour aux cours
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                    <Target size={18} />
                    Niveau détecté
                  </div>

                  <p className="mt-3 text-2xl font-bold text-blue-800">
                    {data.niveauDetecte
                      ? niveauLabel[data.niveauDetecte]
                      : "Aucun"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Gauge size={18} />
                    Difficulté proposée
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {data.difficulteRecommandee
                      ? difficulteLabel[data.difficulteRecommandee]
                      : "Non disponible"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <ListChecks size={18} />
                    Quiz proposés
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {data.recommendations.length}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Lightbulb size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Analyse pédagogique
                  </h2>

                  <p className="text-sm text-slate-500">
                    Résumé automatique basé sur le dernier quiz terminé.
                  </p>
                </div>
              </div>

              {data.niveauDetecte ? (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div
                    className={`rounded-2xl border p-5 ${
                      niveauStyle[data.niveauDetecte]
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      Niveau actuel
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {niveauLabel[data.niveauDetecte]}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-800">
                    <p className="text-sm font-semibold">
                      Recommandation
                    </p>

                    <p className="mt-2 text-sm leading-6">
                      Continuez avec les exercices de difficulté{" "}
                      <span className="font-bold">
                        {data.difficulteRecommandee
                          ? difficulteLabel[data.difficulteRecommandee]
                          : "adaptée"}
                      </span>{" "}
                      pour progresser progressivement.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                  Aucun résultat disponible pour le moment. Terminez un quiz
                  pour obtenir des recommandations.
                </div>
              )}
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    <Layers size={16} />
                    Exercices adaptés
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    Quiz recommandés
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Sélection d’exercices proposée selon votre progression.
                  </p>
                </div>
              </div>

              {data.recommendations.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <FileQuestion size={28} />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900">
                    Aucune recommandation disponible
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Votre professeur doit créer des quiz adaptés à votre niveau.
                  </p>

                  <button
                    onClick={() => navigate("/etudiant")}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <ArrowLeft size={17} />
                    Retour aux cours
                  </button>
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
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              difficultyStyle[quiz.difficulte]
                            }`}
                          >
                            {difficulteLabel[quiz.difficulte]}
                          </span>

                          <h3 className="mt-3 text-lg font-bold text-slate-900">
                            {quiz.titre}
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {quiz.description || "Exercice recommandé"}
                          </p>
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <FileQuestion size={23} />
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
                        Commencer ce quiz
                        <PlayCircle size={18} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentRecommendationsPage;