import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  FileQuestion,
  HelpCircle,
  PlusCircle,
  Save,
  Sigma,
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

    setQuestions(questions.filter((_, questionIndex) => questionIndex !== index));
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
    <div className="min-h-screen bg-slate-50">
      <TeacherNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                <FileQuestion size={16} />
                Création de quiz
              </div>

              <h1 className="mt-4 text-2xl font-bold text-slate-900">
                Créer un quiz
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Créez un quiz diagnostique ou un exercice d’entraînement lié aux
                parties du cours.
              </p>
            </div>

            <button
              onClick={() => navigate("/professeur/quiz")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft size={18} />
              Retour aux quiz
            </button>
          </div>
        </section>

        {erreur && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Brain size={24} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Analyse adaptative
                  </h2>
                  <p className="text-sm text-slate-500">
                    Structure du diagnostic
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  <p className="font-semibold text-slate-900">
                    Quiz diagnostique
                  </p>
                  <p className="mt-2">
                    Évalue plusieurs parties du cours pour calculer un score par
                    partie.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  <p className="font-semibold text-slate-900">
                    Exercice d’entraînement
                  </p>
                  <p className="mt-2">
                    Sert de recommandation après le diagnostic et cible une
                    partie précise.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="flex gap-2">
                    <HelpCircle size={18} className="mt-0.5 shrink-0" />
                    <p>
                      Pour que l’analyse soit précise, reliez chaque question à
                      une partie du cours et à une compétence.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Sigma size={22} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Aide LaTeX
                      </h3>
                      <p className="text-sm text-slate-500">
                        Exemples rapides
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {latexExamples.map((example) => (
                      <div
                        key={example.label}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <p className="text-xs font-medium text-slate-500">
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
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-2">
            {courses.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BookOpen size={32} />
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Aucun cours disponible
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Vous devez créer un cours avant de créer un quiz.
                </p>

                <button
                  onClick={() => navigate("/professeur/cours/nouveau")}
                  className="mt-6 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Créer un cours
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">
                    Informations du quiz
                  </h2>

                  <div className="mt-5 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Cours associé
                      </label>

                      <select
                        value={course}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {courses.map((courseItem) => (
                          <option key={courseItem._id} value={courseItem._id}>
                            {courseItem.titre} — {courseItem.matiere}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Titre du quiz
                      </label>

                      <input
                        value={titre}
                        onChange={(e) => setTitre(e.target.value)}
                        required
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Quiz diagnostique général - Équations"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Type du quiz
                      </label>

                      <select
                        value={type}
                        onChange={(e) =>
                          setType(e.target.value as "diagnostic" | "practice")
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="diagnostic">Quiz diagnostique général</option>
                        <option value="practice">Exercice d’entraînement</option>
                      </select>
                    </div>

                    {type === "practice" && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Partie ciblée par l’entraînement
                        </label>

                        <select
                          value={partieId}
                          onChange={(e) => setPartieId(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                    {courseParts.length === 0 && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Ce cours ne contient pas encore de parties. Vous pouvez
                        créer le quiz, mais l’analyse par partie sera moins
                        précise.
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Description
                      </label>

                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Quiz général pour identifier les parties à renforcer."
                      />
                    </div>
                  </div>
                </div>

                {questions.map((questionItem, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Question {questionIndex + 1}
                        </h3>

                        <p className="text-sm text-slate-500">
                          Reliez la question à une partie du cours et à une
                          compétence évaluée.
                        </p>
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(questionIndex)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Partie du cours
                        </label>

                        <select
                          value={questionItem.partieId}
                          onChange={(e) =>
                            updateQuestionPart(questionIndex, e.target.value)
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        <label className="block text-sm font-medium text-slate-700">
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
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                      <label className="block text-sm font-medium text-slate-700">
                        Énoncé
                      </label>

                      <textarea
                        value={questionItem.question}
                        onChange={(e) =>
                          updateQuestionText(questionIndex, e.target.value)
                        }
                        required
                        rows={4}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder={`Résoudre l'équation :\n\n$$\nx + 5 = 12\n$$`}
                      />
                    </div>

                    {questionItem.question && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase text-slate-500">
                          Aperçu de l’énoncé
                        </p>

                        <MathContent content={questionItem.question} />
                      </div>
                    )}

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {questionItem.choix.map((choice, choiceIndex) => (
                        <div key={choiceIndex}>
                          <label className="block text-sm font-medium text-slate-700">
                            Choix {choiceIndex + 1}
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
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="$ x = 5 $"
                          />

                          {choice && (
                            <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                              <MathContent content={choice} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5">
                      <label className="block text-sm font-medium text-slate-700">
                        Bonne réponse
                      </label>

                      <input
                        value={questionItem.bonneReponse}
                        onChange={(e) =>
                          updateGoodAnswer(questionIndex, e.target.value)
                        }
                        required
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Copiez exactement un des choix"
                      />

                      {questionItem.bonneReponse && (
                        <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                          <MathContent content={questionItem.bonneReponse} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <PlusCircle size={18} />
                    Ajouter une question
                  </button>

                  <button
                    type="submit"
                    disabled={chargement}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Save size={18} />
                    {chargement ? "Création en cours..." : "Créer le quiz"}
                  </button>
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