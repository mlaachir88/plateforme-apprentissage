import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
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
  diagnostic: "border-violet-100 bg-violet-50 text-violet-700",
  practice: "border-emerald-100 bg-emerald-50 text-emerald-700",
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

const answerLetters = ["A", "B", "C", "D", "E", "F"];

function StudentQuizPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [chargement, setChargement] = useState(true);
  const [soumission, setSoumission] = useState(false);
  const [erreur, setErreur] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
            setCurrentQuestionIndex(0);
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
        sessionStorage.setItem(
          `quiz_answers_${quizId}`,
          JSON.stringify(answers)
        );
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
    setCurrentQuestionIndex(0);

    if (quizId) {
      sessionStorage.removeItem(`quiz_answers_${quizId}`);
    }
  };

  const completedAnswers = answers.filter(Boolean).length;

  const progress =
    quiz && quiz.questions.length > 0
      ? Math.round((completedAnswers / quiz.questions.length) * 100)
      : 0;

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion =
    quiz !== null && currentQuestionIndex === quiz.questions.length - 1;

  const canSubmit =
    !soumission && answers.length > 0 && answers.every((answer) => answer);

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((index) => Math.max(0, index - 1));
  };

  const goToNextQuestion = () => {
    if (!quiz) {
      return;
    }

    setCurrentQuestionIndex((index) =>
      Math.min(quiz.questions.length - 1, index + 1)
    );
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
        {chargement && (
          <section className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Clock3 size={23} />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Chargement du quiz...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous récupérons les questions et les choix de réponses.
                </p>
              </div>
            </div>
          </section>
        )}

        {erreur && !quiz && (
          <section className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <p className="font-bold">Une erreur est survenue</p>
            <p className="mt-2 text-sm leading-6">{erreur}</p>

            <button
              onClick={() => navigate("/etudiant")}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
            >
              <ArrowLeft size={17} />
              Retour à mes cours
            </button>
          </section>
        )}

        {!chargement && quiz && (
          <>
            <section className="mb-6 rounded-[2.4rem] border border-violet-100 bg-white/90 p-6 shadow-xl shadow-violet-100/40 backdrop-blur-2xl md:p-8">
              <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div
                    className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold ${
                      quizTypeStyle[quiz.type || "diagnostic"]
                    }`}
                  >
                    {quizTypeLabel[quiz.type || "diagnostic"]}
                  </div>

                  <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                    {quiz.titre}
                  </h1>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                    {quiz.description || "Quiz pédagogique"}
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate("/etudiant")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                    >
                      <ArrowLeft size={17} />
                      Retour aux cours
                    </button>

                    {!result && (
                      <div className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600">
                        <CheckCircle2 size={17} />
                        {completedAnswers}/{quiz.questions.length} réponses
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-violet-700">
                          Questions
                        </p>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                          {quiz.questions.length}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm">
                        <ClipboardList size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-fuchsia-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-fuchsia-700">
                          Réponses données
                        </p>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                          {completedAnswers}/{quiz.questions.length}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 shadow-sm">
                        <CheckCircle2 size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-amber-700">
                          Progression
                        </p>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                          {progress}%
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
                        <Target size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!result && (
                <div className="mt-7">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Progression du quiz</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-violet-600 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </section>

            {erreur && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {erreur}
              </div>
            )}

            {result ? (
              <section className="space-y-6">
                <div className="rounded-[2.3rem] border border-violet-100 bg-white/95 p-8 text-center shadow-xl shadow-violet-100/40 backdrop-blur-xl">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-violet-50 text-violet-600 shadow-sm">
                    <CheckCircle2 size={40} />
                  </div>

                  <p className="mt-6 text-sm font-bold text-violet-600">
                    Résultat du quiz
                  </p>

                  <h2 className="mt-3 text-6xl font-bold tracking-tight text-slate-950">
                    {result.score}%
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {result.bonnesReponses} bonne(s) réponse(s) sur{" "}
                    {result.totalQuestions}
                  </p>

                  <div
                    className={`mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-bold ${
                      niveauStyle[result.niveau]
                    }`}
                  >
                    Niveau détecté : {niveauLabel[result.niveau]}
                  </div>
                </div>

                {result.diagnostic && (
                  <div className="rounded-[2.3rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/35 backdrop-blur-xl md:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                          <BrainCircuit size={24} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                              Analyse adaptative IA
                            </h2>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
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

                          <p className="mt-1 text-sm text-slate-500">
                            Diagnostic personnalisé calculé à partir de vos
                            réponses.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-[1.7rem] border border-violet-100 bg-violet-50/60 p-5">
                        <p className="text-sm font-bold text-violet-700">
                          Partie à renforcer
                        </p>

                        <p className="mt-2 text-lg font-bold text-slate-950">
                          {result.diagnostic.partieFaible || "Non détectée"}
                        </p>
                      </div>

                      <div className="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5">
                        <p className="text-sm font-bold text-slate-700">
                          Recommandation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {result.diagnostic.recommandation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5">
                      <p className="text-sm font-bold text-slate-950">
                        Commentaire pédagogique
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {result.diagnostic.commentaire}
                      </p>
                    </div>

                    {result.diagnostic.ai?.synthese && (
                      <div className="mt-5 rounded-[1.7rem] border border-violet-100 bg-violet-50/60 p-5">
                        <p className="flex items-center gap-2 text-sm font-bold text-violet-900">
                          <Sparkles size={16} />
                          Synthèse IA
                        </p>

                        <p className="mt-2 text-sm leading-6 text-violet-800">
                          {result.diagnostic.ai.synthese}
                        </p>
                      </div>
                    )}

                    {result.diagnostic.ai?.competences && (
                      <div className="mt-5 rounded-[1.7rem] border border-fuchsia-100 bg-fuchsia-50/60 p-5">
                        <p className="flex items-center gap-2 text-sm font-bold text-fuchsia-900">
                          <Target size={16} />
                          Compétences ciblées par l’IA
                        </p>

                        <p className="mt-2 text-sm leading-6 text-fuchsia-800">
                          {result.diagnostic.ai.competences}
                        </p>
                      </div>
                    )}

                    {result.diagnostic.analyseParPartie.length > 0 && (
                      <div className="mt-7">
                        <h3 className="text-lg font-bold text-slate-950">
                          Résultat par partie
                        </h3>

                        <div className="mt-4 space-y-3">
                          {result.diagnostic.analyseParPartie.map((partie) => (
                            <div
                              key={partie.partieId}
                              className="rounded-[1.7rem] border border-slate-100 bg-white p-5 shadow-sm"
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h4 className="font-bold text-slate-950">
                                    {partie.titre}
                                  </h4>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {partie.bonnesReponses}/
                                    {partie.totalQuestions} bonne(s) réponse(s)
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
                      </div>
                    )}

                    {result.diagnostic.competencesFaibles.length > 0 && (
                      <div className="mt-7">
                        <h3 className="text-lg font-bold text-slate-950">
                          Compétences à renforcer
                        </h3>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {result.diagnostic.competencesFaibles.map((item) => (
                            <span
                              key={item.competence}
                              className="rounded-full border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700"
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <button
                    onClick={() => navigate("/etudiant")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white px-5 py-3.5 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50"
                  >
                    <ArrowLeft size={17} />
                    Retour aux cours
                  </button>

                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    <RotateCcw size={17} />
                    Refaire
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/etudiant/quiz/${quizId}/explications`)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                  >
                    <Sparkles size={17} />
                    Expliquer mes erreurs
                  </button>

                  <button
                    onClick={() => navigate("/etudiant/recommandations")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    <Layers size={17} />
                    Recommandations
                  </button>
                </div>
              </section>
            ) : (
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-5">
                  {currentQuestion && (
                    <article className="rounded-[2.3rem] border border-violet-100 bg-white/95 p-5 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8">
                      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                            <ListChecks size={16} />
                            Question {currentQuestionIndex + 1} sur{" "}
                            {quiz.questions.length}
                          </div>

                          <p className="mt-3 text-sm text-slate-500">
                            Choisissez la réponse qui vous semble correcte.
                          </p>
                        </div>

                        {answers[currentQuestionIndex] && (
                          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 size={14} />
                            Réponse sélectionnée
                          </span>
                        )}
                      </div>

                      <div className="rounded-[1.8rem] border border-slate-100 bg-slate-50 p-5 text-slate-800 md:p-6">
                        <MathContent content={currentQuestion.question} />
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-3">
                        {currentQuestion.choix.map((choice, choiceIndex) => {
                          const selected =
                            answers[currentQuestionIndex] === choice;

                          return (
                            <button
                              key={choice}
                              type="button"
                              onClick={() =>
                                handleAnswerChange(currentQuestionIndex, choice)
                              }
                              className={`group flex w-full items-start gap-4 rounded-[1.5rem] border p-4 text-left transition ${
                                selected
                                  ? "border-violet-200 bg-violet-50 ring-4 ring-violet-100"
                                  : "border-slate-100 bg-white hover:border-violet-100 hover:bg-violet-50/40"
                              }`}
                            >
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black transition ${
                                  selected
                                    ? "bg-violet-600 text-white"
                                    : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-violet-600"
                                }`}
                              >
                                {answerLetters[choiceIndex] ||
                                  choiceIndex + 1}
                              </span>

                              <span className="flex-1 text-sm leading-6 text-slate-700">
                                <MathContent content={choice} />
                              </span>

                              {selected && (
                                <CheckCircle2
                                  size={20}
                                  className="mt-1 shrink-0 text-violet-600"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={goToPreviousQuestion}
                          disabled={isFirstQuestion}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronLeft size={18} />
                          Précédent
                        </button>

                        {isLastQuestion ? (
                          <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                          >
                            <CheckCircle2 size={18} />
                            {soumission
                              ? "Correction en cours..."
                              : "Valider mes réponses"}
                            {!soumission && (
                              <ArrowRight
                                size={18}
                                className="transition group-hover:translate-x-0.5"
                              />
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={goToNextQuestion}
                            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                          >
                            Suivant
                            <ChevronRight
                              size={18}
                              className="transition group-hover:translate-x-0.5"
                            />
                          </button>
                        )}
                      </div>

                      {isLastQuestion && !canSubmit && (
                        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                          Répondez à toutes les questions avant de valider.
                        </div>
                      )}
                    </article>
                  )}
                </div>

                <aside className="hidden lg:block">
                  <div className="sticky top-24 rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                        <ClipboardList size={22} />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-950">
                          Navigation
                        </h3>
                        <p className="text-sm text-slate-500">
                          Suivez vos réponses.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-5 gap-2">
                      {quiz.questions.map((question, index) => {
                        const answered = Boolean(answers[index]);
                        const active = index === currentQuestionIndex;

                        return (
                          <button
                            key={question._id}
                            type="button"
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`flex h-11 items-center justify-center rounded-2xl text-sm font-bold transition ${
                              active
                                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                : answered
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                            }`}
                          >
                            {answered && !active ? (
                              <CheckCircle2 size={17} />
                            ) : (
                              index + 1
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Progression</span>
                        <span>{progress}%</span>
                      </div>

                      <div className="mt-2 h-2 rounded-full bg-white">
                        <div
                          className="h-2 rounded-full bg-violet-600 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        {completedAnswers} réponse(s) sur{" "}
                        {quiz.questions.length}.
                      </p>
                    </div>
                  </div>
                </aside>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default StudentQuizPage;