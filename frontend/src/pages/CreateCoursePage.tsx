import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  HelpCircle,
  Layers,
  PlusCircle,
  Save,
  Sigma,
  Trash2,
} from "lucide-react";

import api from "../api/axios";
import TeacherNav from "../components/TeacherNav";
import MathContent from "../components/MathContent";

type CoursePartForm = {
  titre: string;
  description: string;
};

const latexExamples = [
  {
    label: "Équation simple",
    value: "$ 2x + 3 = 7 $",
  },
  {
    label: "Fraction",
    value: "$ \\frac{x - 2}{4} $",
  },
  {
    label: "Racine carrée",
    value: "$ \\sqrt{27} = 3\\sqrt{3} $",
  },
  {
    label: "Grande formule",
    value: "$$\\frac{x - 2}{4} - \\frac{x}{6} = 1 - \\frac{4 - x}{12}$$",
  },
];

function CreateCoursePage() {
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [niveau, setNiveau] = useState("1ere_college");
  const [matiere, setMatiere] = useState("Mathématiques");
  const [contenuTexte, setContenuTexte] = useState("");
  const [parties, setParties] = useState<CoursePartForm[]>([
    {
      titre: "",
      description: "",
    },
  ]);

  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const updatePartTitle = (index: number, value: string) => {
    const updated = [...parties];
    updated[index].titre = value;
    setParties(updated);
  };

  const updatePartDescription = (index: number, value: string) => {
    const updated = [...parties];
    updated[index].description = value;
    setParties(updated);
  };

  const addPart = () => {
    setParties([
      ...parties,
      {
        titre: "",
        description: "",
      },
    ]);
  };

  const removePart = (index: number) => {
    if (parties.length <= 1) {
      return;
    }

    setParties(parties.filter((_, partIndex) => partIndex !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErreur("");
    setChargement(true);

    try {
      const partiesNettoyees = parties
        .filter((partie) => partie.titre.trim() !== "")
        .map((partie) => ({
          titre: partie.titre.trim(),
          description: partie.description.trim(),
        }));

      await api.post("/courses", {
        titre,
        description,
        niveau,
        matiere,
        contenuTexte,
        pdfUrl: "",
        parties: partiesNettoyees,
      });

      navigate("/professeur/cours");
    } catch (error: any) {
      setErreur(
        error.response?.data?.message ||
          "Erreur lors de la création du cours"
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
                <BookOpen size={16} />
                Création de cours
              </div>

              <h1 className="mt-4 text-2xl font-bold text-slate-900">
                Créer un cours
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Rédigez un cours, ajoutez ses parties pédagogiques et utilisez
                LaTeX pour les formules mathématiques.
              </p>
            </div>

            <button
              onClick={() => navigate("/professeur/cours")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft size={18} />
              Retour aux cours
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
                  <Sigma size={24} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">Aide LaTeX</h2>
                  <p className="text-sm text-slate-500">
                    Pour écrire des formules dans le cours
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Formule courte
                  </p>
                  <p className="mt-2 rounded-xl bg-white px-3 py-2 font-mono text-xs text-slate-700">
                    $ x = 5 $
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Grande formule
                  </p>
                  <p className="mt-2 rounded-xl bg-white px-3 py-2 font-mono text-xs text-slate-700">
                    $$ \frac&#123;x&#125;&#123;2&#125; = 5 $$
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  <div className="flex gap-2">
                    <HelpCircle size={18} className="mt-0.5 shrink-0" />
                    <p>
                      Utilisez <span className="font-mono">$...$</span> pour une
                      formule courte et{" "}
                      <span className="font-mono">$$...$$</span> pour une
                      formule centrée.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-900">
                    Exemples
                  </p>

                  <div className="space-y-3">
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Informations du cours
                </h2>

                <div className="mt-5 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Titre du cours
                    </label>

                    <input
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Équations du premier degré"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Description
                    </label>

                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Cours d’introduction aux équations du premier degré."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Niveau
                      </label>

                      <select
                        value={niveau}
                        onChange={(e) => setNiveau(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="1ere_college">
                          1ère année collège
                        </option>
                        <option value="2eme_college">
                          2ème année collège
                        </option>
                        <option value="3eme_college">
                          3ème année collège
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Matière
                      </label>

                      <input
                        value={matiere}
                        onChange={(e) => setMatiere(e.target.value)}
                        required
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Mathématiques"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Layers size={24} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Parties du cours
                      </h2>

                      <p className="text-sm text-slate-500">
                        Ces parties serviront plus tard à analyser les résultats
                        par chapitre.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addPart}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <PlusCircle size={17} />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-4">
                  {parties.map((partie, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          Partie {index + 1}
                        </p>

                        {parties.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePart(index)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                            Supprimer
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">
                            Titre de la partie
                          </label>

                          <input
                            value={partie.titre}
                            onChange={(e) =>
                              updatePartTitle(index, e.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Comprendre une équation et tester une solution"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">
                            Description de la partie
                          </label>

                          <textarea
                            value={partie.description}
                            onChange={(e) =>
                              updatePartDescription(index, e.target.value)
                            }
                            rows={2}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Objectif pédagogique de cette partie."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <FileText size={24} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Contenu du cours
                    </h2>

                    <p className="text-sm text-slate-500">
                      Rédigez le support pédagogique visible par les étudiants.
                    </p>
                  </div>
                </div>

                <textarea
                  value={contenuTexte}
                  onChange={(e) => setContenuTexte(e.target.value)}
                  required
                  rows={12}
                  className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder={`Définition :\nUne équation du premier degré est une égalité contenant une inconnue.\n\nExemple :\n$$\n2x + 3 = 7\n$$\n\nOn soustrait 3 :\n$$\n2x = 4\n$$\n\nDonc : $ x = 2 $`}
                />

                {contenuTexte && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="mb-3 text-xs font-semibold uppercase text-slate-500">
                      Aperçu du cours
                    </p>

                    <MathContent content={contenuTexte} />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={chargement}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                <Save size={18} />
                {chargement ? "Création en cours..." : "Créer le cours"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default CreateCoursePage;