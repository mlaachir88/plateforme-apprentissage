import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  Layers,
  PlusCircle,
  Save,
  Sigma,
  Sparkles,
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
        error.response?.data?.message || "Erreur lors de la création du cours"
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
                <BookOpen size={16} />
                Création de cours
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                Créer un cours
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Rédigez un cours, ajoutez ses parties pédagogiques et utilisez
                LaTeX pour les formules mathématiques.
              </p>
            </div>

            <button
              onClick={() => navigate("/professeur/cours")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
            >
              <ArrowLeft size={18} />
              Retour aux cours
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
            <div className="sticky top-24 rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Sigma size={24} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">Aide LaTeX</h2>
                  <p className="text-sm text-slate-500">
                    Pour écrire des formules.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                  <p className="text-sm font-bold text-violet-800">
                    Formule courte
                  </p>
                  <p className="mt-2 rounded-xl bg-white px-3 py-2 font-mono text-xs text-slate-700">
                    $ x = 5 $
                  </p>
                </div>

                <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/60 p-4">
                  <p className="text-sm font-bold text-fuchsia-800">
                    Grande formule
                  </p>
                  <p className="mt-2 rounded-xl bg-white px-3 py-2 font-mono text-xs text-slate-700">
                    $$ \frac&#123;x&#125;&#123;2&#125; = 5 $$
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="flex gap-2">
                    <HelpCircle size={18} className="mt-0.5 shrink-0" />
                    <p className="leading-6">
                      Utilisez <span className="font-mono">$...$</span> pour
                      une formule courte et{" "}
                      <span className="font-mono">$$...$$</span> pour une
                      formule centrée.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-bold text-slate-950">
                    Exemples
                  </p>

                  <div className="space-y-3">
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
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:order-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <FileText size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      Informations du cours
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Définissez le titre, la description, le niveau et la
                      matière.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700">
                      Titre du cours
                    </label>

                    <input
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      required
                      className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      placeholder="Équations du premier degré"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700">
                      Description
                    </label>

                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      placeholder="Cours d’introduction aux équations du premier degré."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-700">
                        Niveau
                      </label>

                      <select
                        value={niveau}
                        onChange={(e) => setNiveau(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
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
                      <label className="block text-sm font-bold text-slate-700">
                        Matière
                      </label>

                      <input
                        value={matiere}
                        onChange={(e) => setMatiere(e.target.value)}
                        required
                        className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        placeholder="Mathématiques"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <Layers size={24} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                        Parties du cours
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Ces parties serviront à analyser les résultats par
                        chapitre.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addPart}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2.5 text-sm font-bold text-violet-700 shadow-sm transition hover:bg-violet-50"
                  >
                    <PlusCircle size={17} />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-4">
                  {parties.map((partie, index) => (
                    <div
                      key={index}
                      className="rounded-[1.7rem] border border-violet-100 bg-violet-50/40 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold text-violet-700">
                          <Layers size={15} />
                          Partie {index + 1}
                        </div>

                        {parties.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePart(index)}
                            className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                            Supprimer
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700">
                            Titre de la partie
                          </label>

                          <input
                            value={partie.titre}
                            onChange={(e) =>
                              updatePartTitle(index, e.target.value)
                            }
                            className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                            placeholder="Comprendre une équation et tester une solution"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700">
                            Description de la partie
                          </label>

                          <textarea
                            value={partie.description}
                            onChange={(e) =>
                              updatePartDescription(index, e.target.value)
                            }
                            rows={2}
                            className="mt-2 w-full resize-none rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                            placeholder="Objectif pédagogique de cette partie."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <BookOpen size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      Contenu du cours
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Rédigez le support pédagogique visible par les étudiants.
                    </p>
                  </div>
                </div>

                <textarea
                  value={contenuTexte}
                  onChange={(e) => setContenuTexte(e.target.value)}
                  required
                  rows={14}
                  className="mt-6 w-full rounded-[1.7rem] border border-violet-100 bg-white px-5 py-4 font-mono text-sm leading-7 text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  placeholder={`Définition :\nUne équation du premier degré est une égalité contenant une inconnue.\n\nExemple :\n$$\n2x + 3 = 7\n$$\n\nOn soustrait 3 :\n$$\n2x = 4\n$$\n\nDonc : $ x = 2 $`}
                />

                {contenuTexte && (
                  <div className="mt-5 rounded-[1.7rem] border border-violet-100 bg-violet-50/40 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-violet-700">
                      <Sparkles size={15} />
                      Aperçu du cours
                    </div>

                    <div className="rounded-2xl bg-white p-5 text-sm leading-7 text-slate-700 shadow-sm">
                      <MathContent content={contenuTexte} />
                    </div>
                  </div>
                )}
              </section>

              <button
                type="submit"
                disabled={chargement}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <Save size={18} />
                {chargement ? "Création en cours..." : "Créer le cours"}

                {!chargement && (
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-0.5"
                  />
                )}
              </button>

              <div className="rounded-[1.7rem] border border-emerald-100 bg-emerald-50 p-5 text-emerald-700">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                  <p className="text-sm font-semibold leading-6">
                    Le cours sera créé sans accès étudiant par défaut. Vous
                    pourrez ensuite autoriser les étudiants depuis la page de
                    gestion des accès.
                  </p>
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default CreateCoursePage;