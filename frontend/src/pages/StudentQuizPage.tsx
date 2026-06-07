import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Layers,
  ListChecks,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";

import api from "../api/axios";
import MathContent from "../components/MathContent";
import StudentNav from "../components/StudentNav";

type Quiz = {
  _id: string;
  titre: string;
  description: string;
  type: "diagnostic" | "practice";
  partieId?: string;
  questions: {
    _id: string;
    question: string;
    choix: string[];
    partieId?: string;
    competence?: string;
  }[];
};

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

type Result = {
  score: number;
  niveau: "weak" | "medium" | "strong";
  bonnesReponses: number;
  totalQuestions: number;
  diagnostic?: Diagnostic;
};

const niveauLabel = {
  weak: "À renforcer",
  medium: "Moyen",
  strong: "Solide",
};

const quizTypeLabel = {
  diagnostic: "Diagnostic général",
  practice: "Exercice d’entraînement",
};

const quizTypeStyle = {
  diagnostic: "bg-blue-50 text-blue-700 border-blue-200",
  practice: "bg-emerald-50 text-emerald-700 border-emerald-200",
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

function StudentQuizPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [chargement, setChargement] = useState(true);
  const [soumission, setSoumission] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const coursesResponse = await api.get("/courses");
        const courses = coursesResponse.data;

        for (const course of courses) {
          const quizzesResponse = await api.get(`/quizzes/course/${course._id}`);

          const foundQuiz = quizzesResponse.data.find(
            (item: Quiz) => item._id === quizId
          );

          if (foundQuiz) {
            setQuiz(foundQuiz);
            setAnswers(new Array(foundQuiz.questions.length).fill(""));
            return;
          }
        }

        setErreur("Quiz introuvable ou accès refusé");
      } catch (error: any) {
        setErreur(
          error.response?.data?.message || "Erreur lors du chargement du quiz"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    setErreur("");
    setSoumission(true);

    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, {
        answers,
      });

      if (quizId) {
        sessionStorage.setItem(`quiz_answers_${quizId}`, JSON.stringify(answers));
      }

      setResult({
        score: response.data.score,
        niveau: response.data.niveau,
        bonnesReponses: response.data.bonnesReponses,
        totalQuestions: response.data.totalQuestions,
        diagnostic: response.data.diagnostic,
      });
    } catch (error: any) {
      setErreur(
        error.response?.data?.message || "Erreur lors de la soumission du quiz"
      );
    } finally {
      setSoumission(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers(new Array(quiz?.questions.length || 0).fill(""));

    if (quizId) {
      sessionStorage.removeItem(`quiz_answers_${quizId}`);
    }
  };

  const completedAnswers = answers.filter(Boolean).length;

  const progress =
    quiz && quiz.questions.length > 0
      ? Math.round((completedAnswers / quiz.questions.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNav />

      <main className="mx-auto max-w-5xl px-6 py-8">
        {chargement && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
            Chargement du quiz...
          </div>
        )}

        {erreur && !quiz && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {erreur}

            <button
              onClick={() => navigate("/etudiant")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <ArrowLeft size={17} />
              Retour à mes cours
            </button>
          </div>
        )}

        {!chargement && quiz && (
          <>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-10 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.35),transparent_35%)]" />

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div
                      className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${
                        quizTypeStyle[quiz.type || "diagnostic"]
                      }`}
                    >
                      {quizTypeLabel[quiz.type || "diagnostic"]}
                    </div>

                    <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
                      {quiz.titre}
                    </h1>

                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">
                      {quiz.description || "Quiz pédagogique"}
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

              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                    <ClipboardList size={18} />
                    Questions
                  </div>

                  <p className="mt-3 text-3xl font-bold text-blue-800">
                    {quiz.questions.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <CheckCircle2 size={18} />
                    Réponses données
                  </div>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {completedAnswers}/{quiz.questions.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Target size={18} />
                    Progression
                  </div>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {progress}%
                  </p>
                </div>
              </div>
            </section>

            {erreur && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {erreur}
              </div>
            )}

            {result ? (
              <section className="mt-6 space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <CheckCircle2 size={34} />
                  </div>

                  <p className="mt-5 text-sm font-medium text-blue-600">
                    Résultat du quiz
                  </p>

                  <h2 className="mt-3 text-5xl font-bold text-slate-900">
                    {result.score}%
                  </h2>

                  <p className="mt-4 text-slate-600">
                    {result.bonnesReponses} bonne(s) réponse(s) sur{" "}
                    {result.totalQuestions}
                  </p>

                  <div
                    className={`mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${
                      niveauStyle[result.niveau]
                    }`}
                  >
                    Niveau détecté : {niveauLabel[result.niveau]}
                  </div>
                </div>

                {result.diagnostic && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <BrainCircuit size={24} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900">
                            Analyse adaptative IA
                          </h2>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              result.diagnostic.ai?.source === "openai"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Sparkles size={13} />
                            {result.diagnostic.ai?.source === "openai"
                              ? "Générée par IA"
                              : "Analyse automatique"}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500">
                          Diagnostic personnalisé calculé à partir de vos réponses.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        <p className="text-sm font-semibold text-blue-700">
                          Partie à renforcer
                        </p>

                        <p className="mt-2 text-lg font-bold text-blue-900">
                          {result.diagnostic.partieFaible || "Non détectée"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm font-semibold text-slate-700">
                          Recommandation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {result.diagnostic.recommandation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-900">
                        Commentaire pédagogique
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {result.diagnostic.commentaire}
                      </p>
                    </div>

                    {result.diagnostic.ai?.synthese && (
                      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                        <p className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                          <Sparkles size={16} />
                          Synthèse IA
                        </p>

                        <p className="mt-2 text-sm leading-6 text-indigo-800">
                          {result.diagnostic.ai.synthese}
                        </p>
                      </div>
                    )}

                    {result.diagnostic.ai?.competences && (
                      <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-5">
                        <p className="flex items-center gap-2 text-sm font-semibold text-violet-900">
                          <Target size={16} />
                          Compétences ciblées par l’IA
                        </p>

                        <p className="mt-2 text-sm leading-6 text-violet-800">
                          {result.diagnostic.ai.competences}
                        </p>
                      </div>
                    )}

                    {result.diagnostic.analyseParPartie.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-bold text-slate-900">
                          Résultat par partie
                        </h3>

                        <div className="mt-4 space-y-3">
                          {result.diagnostic.analyseParPartie.map((partie) => (
                            <div
                              key={partie.partieId}
                              className="rounded-2xl border border-slate-200 bg-white p-5"
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h4 className="font-semibold text-slate-900">
                                    {partie.titre}
                                  </h4>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {partie.bonnesReponses}/
                                    {partie.totalQuestions} bonne(s) réponse(s)
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
                      </div>
                    )}

                    {result.diagnostic.competencesFaibles.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-bold text-slate-900">
                          Compétences à renforcer
                        </h3>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {result.diagnostic.competencesFaibles.map((item) => (
                            <span
                              key={item.competence}
                              className="rounded-full bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
                            >
                              {competenceLabel[item.competence] ||
                                item.competence}{" "}
                              · {item.erreurs} erreur(s)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <button
                    onClick={() => navigate("/etudiant")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <ArrowLeft size={17} />
                    Retour aux cours
                  </button>

                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <RotateCcw size={17} />
                    Refaire
                  </button>

                  <button
                    onClick={() => navigate(`/etudiant/quiz/${quizId}/explications`)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    <Sparkles size={17} />
                    Expliquer mes erreurs
                  </button>

                  <button
                    onClick={() => navigate("/etudiant/recommandations")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <Layers size={17} />
                    Recommandations
                  </button>
                </div>
              </section>
            ) : (
              <section className="mt-6 space-y-5">
                {quiz.questions.map((question, questionIndex) => (
                  <article
                    key={question._id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                        <ListChecks size={16} />
                        Question {questionIndex + 1}
                      </div>

                      {answers[questionIndex] && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Réponse sélectionnée
                        </span>
                      )}
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5 text-slate-800">
                      <MathContent content={question.question} />
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {question.choix.map((choice) => {
                        const selected = answers[questionIndex] === choice;

                        return (
                          <label
                            key={choice}
                            className={`cursor-pointer rounded-2xl border p-4 transition ${
                              selected
                                ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name={`question-${questionIndex}`}
                                value={choice}
                                checked={selected}
                                onChange={() =>
                                  handleAnswerChange(questionIndex, choice)
                                }
                                className="mt-1 h-4 w-4"
                              />

                              <div className="text-sm text-slate-700">
                                <MathContent content={choice} />
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </article>
                ))}

                <button
                  onClick={handleSubmit}
                  disabled={soumission || answers.some((answer) => !answer)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  <CheckCircle2 size={18} />
                  {soumission ? "Correction en cours..." : "Valider mes réponses"}
                </button>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default StudentQuizPage;