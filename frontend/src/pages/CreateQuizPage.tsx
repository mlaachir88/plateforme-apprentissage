import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  PlusCircle,
  Save,
  Sigma,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";

import api from "../api/axios";
import TeacherNav from "../components/TeacherNav";
import MathContent from "../components/MathContent";

type CoursePart = {
  _id: string;
  titre: string;
  description: string;
};

type Course = {
  _id: string;
  titre: string;
  matiere: string;
  niveau: string;
  parties?: CoursePart[];
};

type QuestionForm = {
  question: string;
  choix: string[];
  bonneReponse: string;
  partieId: string;
  competence: string;
};

const latexExamples = [
  {
    label: "Fraction",
    value: "$ \\frac{x - 2}{4} $",
  },
  {
    label: "Racine carrée",
    value: "$ \\sqrt{3} $",
  },
  {
    label: "Puissance",
    value: "$ x^2 $",
  },
  {
    label: "Grande équation",
    value: "$$\\frac{x - 2}{4} - \\frac{x}{6} = 1 - \\frac{4 - x}{12}$$",
  },
];

const competences = [
  {
    value: "comprehension",
    label: "Compréhension de la consigne",
  },
  {
    value: "calcul",
    label: "Calcul",
  },
  {
    value: "resolution_equation",
    label: "Résolution d’équation",
  },
  {
    value: "application_regle",
    label: "Application d’une règle",
  },
  {
    value: "raisonnement",
    label: "Raisonnement mathématique",
  },
  {
    value: "autre",
    label: "Autre",
  },
];

function CreateQuizPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [course, setCourse] = useState("");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"diagnostic" | "practice">("diagnostic");
  const [partieId, setPartieId] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      question: "",
      choix: ["", "", "", ""],
      bonneReponse: "",
      partieId: "",
      competence: "autre",
    },
    {
      question: "",
      choix: ["", "", "", ""],
      bonneReponse: "",
      partieId: "",
      competence: "autre",
    },
  ]);

  const selectedCourse = courses.find((courseItem) => courseItem._id === course);
  const courseParts = selectedCourse?.parties || [];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        const coursesData: Course[] = response.data;

        setCourses(coursesData);

        if (coursesData.length > 0) {
          const firstCourse = coursesData[0];
          const firstPartId = firstCourse.parties?.[0]?._id || "";

          setCourse(firstCourse._id);
          setPartieId(firstPartId);

          setQuestions((previousQuestions) =>
            previousQuestions.map((question) => ({
              ...question,
              partieId: firstPartId,
            }))
          );
        }
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement des cours"
        );
      }
    };

    fetchCourses();
  }, []);

  const handleCourseChange = (courseId: string) => {
    setCourse(courseId);

    const newCourse = courses.find((courseItem) => courseItem._id === courseId);
    const firstPartId = newCourse?.parties?.[0]?._id || "";

    setPartieId(firstPartId);

    setQuestions((previousQuestions) =>
      previousQuestions.map((question) => ({
        ...question,
        partieId: firstPartId,
      }))
    );
  };

  const updateQuestionText = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const updateChoice = (
    questionIndex: number,
    choiceIndex: number,
    value: string
  ) => {
    const updated = [...questions];
    updated[questionIndex].choix[choiceIndex] = value;
    setQuestions(updated);
  };

  const updateGoodAnswer = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].bonneReponse = value;
    setQuestions(updated);
  };

  const updateQuestionPart = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].partieId = value;
    setQuestions(updated);
  };

  const updateQuestionCompetence = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].competence = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        choix: ["", "", "", ""],
        bonneReponse: "",
        partieId: courseParts[0]?._id || "",
        competence: "autre",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      return;
    }

    setQuestions(
      questions.filter((_, questionIndex) => questionIndex !== index)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErreur("");
    setChargement(true);

    try {
      const questionsNettoyees = questions.map((q) => ({
        question: q.question,
        choix: q.choix,
        bonneReponse: q.bonneReponse,
        partieId: q.partieId,
        competence: q.competence,
      }));

      await api.post("/quizzes", {
        titre,
        description,
        type,
        course,
        partieId: type === "practice" ? partieId : "",
        questions: questionsNettoyees,
      });

      navigate("/professeur/quiz");
    } catch (error: any) {
      setErreur(
        error.response?.data?.message || "Erreur lors de la création du quiz"
      );
    } finally {
      setChargement(false);
    }
  };

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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                <FileQuestion size={16} />
                Création de quiz
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                Créer un quiz
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Créez un quiz diagnostique ou un exercice d’entraînement lié aux
                parties du cours.
              </p>
            </div>

            <button
              onClick={() => navigate("/professeur/quiz")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
            >
              <ArrowLeft size={18} />
              Retour aux quiz
            </button>
          </div>
        </section>

        {erreur && (
          <section className="mb-5 rounded-[1.7rem] border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-semibold leading-6">{erreur}</p>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="lg:order-1">
            <div className="sticky top-24 space-y-5">
              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Brain size={24} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-950">
                      Analyse adaptative
                    </h2>
                    <p className="text-sm text-slate-500">
                      Structure du diagnostic.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4 text-sm leading-6 text-slate-600">
                    <p className="font-bold text-violet-800">
                      Quiz diagnostique
                    </p>
                    <p className="mt-2">
                      Évalue plusieurs parties du cours pour calculer un score
                      par partie.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-slate-600">
                    <p className="font-bold text-emerald-800">
                      Exercice d’entraînement
                    </p>
                    <p className="mt-2">
                      Sert de recommandation après le diagnostic et cible une
                      partie précise.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                    <div className="flex gap-2">
                      <HelpCircle size={18} className="mt-0.5 shrink-0" />
                      <p className="leading-6">
                        Pour que l’analyse soit précise, reliez chaque question
                        à une partie du cours et à une compétence.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Sigma size={24} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-950">Aide LaTeX</h2>
                    <p className="text-sm text-slate-500">
                      Exemples rapides.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {latexExamples.map((example) => (
                    <div
                      key={example.label}
                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <p className="text-xs font-bold text-slate-500">
                        {example.label}
                      </p>

                      <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
                        {example.value}
                      </p>

                      <div className="mt-3 rounded-xl bg-white text-sm text-slate-700">
                        <MathContent content={example.value} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>

          <section className="lg:order-2">
            {courses.length === 0 ? (
              <div className="rounded-[2.3rem] border border-violet-100 bg-white/95 p-10 text-center shadow-xl shadow-violet-100/40 backdrop-blur-xl">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-violet-50 text-violet-600 shadow-sm">
                  <BookOpen size={40} />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  Aucun cours disponible
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                  Vous devez créer un cours avant de créer un quiz.
                </p>

                <button
                  onClick={() => navigate("/professeur/cours/nouveau")}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                >
                  <PlusCircle size={18} />
                  Créer un cours
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <FileQuestion size={24} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                        Informations du quiz
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Choisissez le cours, le type du quiz et sa description.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700">
                        Cours associé
                      </label>

                      <select
                        value={course}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      >
                        {courses.map((courseItem) => (
                          <option key={courseItem._id} value={courseItem._id}>
                            {courseItem.titre} — {courseItem.matiere}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700">
                        Titre du quiz
                      </label>

                      <input
                        value={titre}
                        onChange={(e) => setTitre(e.target.value)}
                        required
                        className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        placeholder="Quiz diagnostique général - Équations"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-bold text-slate-700">
                          Type du quiz
                        </label>

                        <select
                          value={type}
                          onChange={(e) =>
                            setType(
                              e.target.value as "diagnostic" | "practice"
                            )
                          }
                          className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        >
                          <option value="diagnostic">
                            Quiz diagnostique général
                          </option>
                          <option value="practice">
                            Exercice d’entraînement
                          </option>
                        </select>
                      </div>

                      {type === "practice" && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700">
                            Partie ciblée
                          </label>

                          <select
                            value={partieId}
                            onChange={(e) => setPartieId(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                          >
                            <option value="">Aucune partie</option>
                            {courseParts.map((partie) => (
                              <option key={partie._id} value={partie._id}>
                                {partie.titre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {courseParts.length === 0 && (
                      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
                        Ce cours ne contient pas encore de parties. Vous pouvez
                        créer le quiz, mais l’analyse par partie sera moins
                        précise.
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-slate-700">
                        Description
                      </label>

                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        placeholder="Quiz général pour identifier les parties à renforcer."
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                      <p className="text-xs font-bold text-violet-700">
                        Questions
                      </p>
                      <p className="mt-1 text-3xl font-bold text-slate-950">
                        {questions.length}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs font-bold text-amber-700">
                        Type
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-950">
                        {type === "diagnostic"
                          ? "Diagnostic"
                          : "Entraînement"}
                      </p>
                    </div>
                  </div>
                </section>

                {questions.map((questionItem, questionIndex) => (
                  <section
                    key={questionIndex}
                    className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8"
                  >
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                          <Target size={24} />
                        </div>

                        <div>
                          <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                            Question {questionIndex + 1}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Reliez la question à une partie du cours et à une
                            compétence évaluée.
                          </p>
                        </div>
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(questionIndex)}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-bold text-slate-700">
                          Partie du cours
                        </label>

                        <select
                          value={questionItem.partieId}
                          onChange={(e) =>
                            updateQuestionPart(questionIndex, e.target.value)
                          }
                          className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        >
                          <option value="">Aucune partie</option>
                          {courseParts.map((partie) => (
                            <option key={partie._id} value={partie._id}>
                              {partie.titre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700">
                          Compétence évaluée
                        </label>

                        <select
                          value={questionItem.competence}
                          onChange={(e) =>
                            updateQuestionCompetence(
                              questionIndex,
                              e.target.value
                            )
                          }
                          className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        >
                          {competences.map((competence) => (
                            <option
                              key={competence.value}
                              value={competence.value}
                            >
                              {competence.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="block text-sm font-bold text-slate-700">
                        Énoncé
                      </label>

                      <textarea
                        value={questionItem.question}
                        onChange={(e) =>
                          updateQuestionText(questionIndex, e.target.value)
                        }
                        required
                        rows={4}
                        className="mt-2 w-full rounded-[1.5rem] border border-violet-100 bg-white px-4 py-3 font-mono text-sm leading-7 text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        placeholder={`Résoudre l'équation :\n\n$$\nx + 5 = 12\n$$`}
                      />
                    </div>

                    {questionItem.question && (
                      <div className="mt-4 rounded-[1.7rem] border border-violet-100 bg-violet-50/40 p-4">
                        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-violet-700">
                          <Sparkles size={15} />
                          Aperçu de l’énoncé
                        </div>

                        <div className="rounded-2xl bg-white p-4 text-sm leading-7 text-slate-700 shadow-sm">
                          <MathContent content={questionItem.question} />
                        </div>
                      </div>
                    )}

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {questionItem.choix.map((choice, choiceIndex) => {
                        const letter = String.fromCharCode(65 + choiceIndex);
                        const isGoodAnswer =
                          choice &&
                          questionItem.bonneReponse &&
                          choice === questionItem.bonneReponse;

                        return (
                          <div key={choiceIndex}>
                            <label className="block text-sm font-bold text-slate-700">
                              Choix {letter}
                            </label>

                            <input
                              value={choice}
                              onChange={(e) =>
                                updateChoice(
                                  questionIndex,
                                  choiceIndex,
                                  e.target.value
                                )
                              }
                              required
                              className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 font-mono text-sm font-semibold text-slate-700 outline-none transition focus:ring-4 ${
                                isGoodAnswer
                                  ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                                  : "border-violet-100 focus:border-violet-400 focus:ring-violet-100"
                              }`}
                              placeholder="$ x = 5 $"
                            />

                            {choice && (
                              <div
                                className={`mt-2 rounded-2xl border px-3 py-2 text-sm ${
                                  isGoodAnswer
                                    ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                                    : "border-slate-100 bg-slate-50 text-slate-700"
                                }`}
                              >
                                <MathContent content={choice} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5">
                      <label className="block text-sm font-bold text-slate-700">
                        Bonne réponse
                      </label>

                      <input
                        value={questionItem.bonneReponse}
                        onChange={(e) =>
                          updateGoodAnswer(questionIndex, e.target.value)
                        }
                        required
                        className="mt-2 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 font-mono text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        placeholder="Copiez exactement un des choix"
                      />

                      {questionItem.bonneReponse && (
                        <div className="mt-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                          <MathContent content={questionItem.bonneReponse} />
                        </div>
                      )}
                    </div>
                  </section>
                ))}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-4 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50"
                  >
                    <PlusCircle size={18} />
                    Ajouter une question
                  </button>

                  <button
                    type="submit"
                    disabled={chargement}
                    className="group inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <Save size={18} />
                    {chargement ? "Création en cours..." : "Créer le quiz"}

                    {!chargement && (
                      <ArrowRight
                        size={18}
                        className="transition group-hover:translate-x-0.5"
                      />
                    )}
                  </button>
                </div>

                <div className="rounded-[1.7rem] border border-emerald-100 bg-emerald-50 p-5 text-emerald-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-semibold leading-6">
                      Après création, ce quiz sera disponible dans la liste des
                      quiz du professeur et pourra être passé par les étudiants
                      autorisés au cours.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default CreateQuizPage;