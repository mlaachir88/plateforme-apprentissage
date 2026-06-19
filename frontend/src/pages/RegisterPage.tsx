import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LockKeyhole,
  Mail,
  School,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import api from "../api/axios";

function RegisterPage() {
  const navigate = useNavigate();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [niveauScolaire, setNiveauScolaire] = useState("1ere_college");
  const [classe, setClasse] = useState("classe_1");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErreur("");
    setChargement(true);

    try {
      const response = await api.post("/auth/register", {
        prenom,
        nom,
        email,
        motDePasse,
        niveauScolaire,
        classe,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/etudiant");
    } catch (error: any) {
      setErreur(
        error.response?.data?.message || "Erreur lors de la création du compte"
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbf8ff] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute right-[-220px] top-[220px] h-[460px] w-[460px] rounded-full bg-fuchsia-200/35 blur-3xl" />
        <div className="absolute bottom-[-240px] left-[-160px] h-[500px] w-[500px] rounded-full bg-amber-100/45 blur-3xl" />
      </div>

      <header className="border-b border-violet-100/80 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600 shadow-sm shadow-violet-100/60 transition group-hover:scale-105">
              <GraduationCap size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold leading-none text-violet-600">
                Plateforme d’apprentissage
              </p>
              <h1 className="mt-1 text-base font-bold tracking-tight text-slate-950">
                Inscription étudiant
              </h1>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
          >
            <ArrowLeft size={17} />
            Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 gap-8 px-5 py-8 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-14">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-sm font-bold text-violet-700 shadow-sm shadow-violet-100/60 backdrop-blur-xl">
              <Sparkles size={16} />
              Créez un parcours adapté dès le départ
            </div>

            <h2 className="mt-7 text-5xl font-bold tracking-[-0.055em] text-slate-950 xl:text-6xl">
              Un compte étudiant pour apprendre à son rythme.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Après inscription, l’élève peut accéder aux cours autorisés,
              passer les quiz diagnostiques, consulter ses résultats et recevoir
              des recommandations personnalisées selon son niveau.
            </p>

            <div className="mt-9 grid grid-cols-1 gap-4">
              <div className="rounded-[2rem] border border-violet-100 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <BookOpen size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Accès aux cours autorisés
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      L’élève retrouve uniquement les cours attribués par son
                      professeur pour garder un parcours clair.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-violet-100 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
                    <School size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Niveau et classe renseignés
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Le compte contient le niveau scolaire et la classe pour
                      faciliter le suivi pédagogique.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-violet-100 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <ShieldCheck size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Compte sécurisé
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      La connexion utilise un token sécurisé pour accéder à
                      l’espace personnel de l’élève.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-2xl lg:ml-auto lg:mr-0">
            <div className="relative">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-violet-200/70 via-fuchsia-100/55 to-amber-100/50 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2.2rem] border border-white bg-white/85 p-5 shadow-2xl shadow-violet-200/60 backdrop-blur-2xl md:p-6">
                <div className="rounded-[1.8rem] border border-violet-100 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-8">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600 shadow-sm">
                      <User size={27} />
                    </div>

                    <p className="text-sm font-bold text-violet-600">
                      Nouveau compte
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                      Créer un compte étudiant.
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Inscrivez-vous pour accéder aux cours attribués par votre
                      professeur.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled
                      className="group flex items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-80"
                      title="Inscription Google bientôt disponible"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
                        <span className="bg-gradient-to-br from-blue-500 via-red-500 to-amber-400 bg-clip-text text-sm font-black text-transparent">
                          G
                        </span>
                      </span>
                      Google
                    </button>

                    <button
                      type="button"
                      disabled
                      className="group flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-90"
                      title="Inscription Apple bientôt disponible"
                    >
                      <span className="text-xl leading-none"></span>
                      Apple
                    </button>
                  </div>

                  <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-medium leading-5 text-amber-700">
                      Google et Apple sont affichés pour préparer une future
                      connexion rapide. L’inscription actuelle se fait avec
                      email et mot de passe.
                    </p>
                  </div>

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-violet-100" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      ou avec email
                    </span>
                    <div className="h-px flex-1 bg-violet-100" />
                  </div>

                  {erreur && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
                      {erreur}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-bold text-slate-700">
                          Prénom
                        </label>

                        <div className="relative mt-2">
                          <User
                            size={18}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            required
                            className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3.5 pl-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                            placeholder="Mohamed"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700">
                          Nom
                        </label>

                        <div className="relative mt-2">
                          <Users
                            size={18}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            required
                            className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3.5 pl-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                            placeholder="Laachir"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700">
                        Adresse email
                      </label>

                      <div className="relative mt-2">
                        <Mail
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3.5 pl-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                          placeholder="etudiant@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <label className="block text-sm font-bold text-slate-700">
                          Mot de passe
                        </label>

                        <span className="text-xs font-semibold text-slate-400">
                          Minimum 6 caractères
                        </span>
                      </div>

                      <div className="relative mt-2">
                        <LockKeyhole
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="password"
                          value={motDePasse}
                          onChange={(e) => setMotDePasse(e.target.value)}
                          required
                          minLength={6}
                          className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3.5 pl-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                          placeholder="Minimum 6 caractères"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-bold text-slate-700">
                          Niveau scolaire
                        </label>

                        <select
                          value={niveauScolaire}
                          onChange={(e) => setNiveauScolaire(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
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
                          Classe
                        </label>

                        <select
                          value={classe}
                          onChange={(e) => setClasse(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                        >
                          <option value="classe_1">Classe 1</option>
                          <option value="classe_2">Classe 2</option>
                          <option value="classe_3">Classe 3</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={chargement}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {chargement ? "Création en cours..." : "Créer mon compte"}
                      {!chargement && (
                        <ArrowRight
                          size={18}
                          className="transition group-hover:translate-x-0.5"
                        />
                      )}
                    </button>
                  </form>

                  <div className="mt-6 rounded-2xl bg-violet-50/60 p-4">
                    <p className="text-center text-sm leading-6 text-slate-500">
                      Déjà un compte ?{" "}
                      <Link
                        to="/connexion"
                        className="font-bold text-violet-600 hover:text-violet-700"
                      >
                        Se connecter
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-3xl bg-violet-50 p-4 text-center">
                    <p className="text-lg font-bold text-violet-700">Cours</p>
                    <p className="mt-1 text-xs font-medium text-violet-600">
                      Autorisés
                    </p>
                  </div>

                  <div className="rounded-3xl bg-fuchsia-50 p-4 text-center">
                    <p className="text-lg font-bold text-fuchsia-700">Quiz</p>
                    <p className="mt-1 text-xs font-medium text-fuchsia-600">
                      Diagnostic
                    </p>
                  </div>

                  <div className="rounded-3xl bg-amber-50 p-4 text-center">
                    <p className="text-lg font-bold text-amber-700">IA</p>
                    <p className="mt-1 text-xs font-medium text-amber-600">
                      Analyse
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-6 text-slate-400">
              Cette version teste une identité visuelle violet premium avant de
              l’appliquer aux autres pages.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RegisterPage;