import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import api from "../api/axios";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErreur("");
    setChargement(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        motDePasse,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "teacher") {
        navigate("/professeur");
      } else {
        navigate("/etudiant");
      }
    } catch (error: any) {
      setErreur(error.response?.data?.message || "Erreur lors de la connexion");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbf8ff] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute right-[-220px] top-[220px] h-[460px] w-[460px] rounded-full bg-fuchsia-200/25 blur-3xl" />
        <div className="absolute bottom-[-240px] left-[-160px] h-[500px] w-[500px] rounded-full bg-amber-100/35 blur-3xl" />
      </div>

      <header className="border-b border-violet-100 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-xl shadow-violet-600/20 transition group-hover:scale-105">
              <GraduationCap size={22} />
            </div>

            <div>
              <p className="text-sm font-bold leading-none text-violet-600">
                Plateforme d’apprentissage
              </p>
              <h1 className="mt-1 text-base font-black tracking-tight text-slate-950">
                Connexion sécurisée
              </h1>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2.5 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
          >
            <ArrowLeft size={17} />
            Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 gap-8 px-5 py-8 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-14">
        <section className="order-2 hidden lg:order-1 lg:block">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/85 px-4 py-2 text-sm font-bold text-violet-700 shadow-sm shadow-violet-100/60 backdrop-blur-xl">
              <Sparkles size={16} />
              Espace intelligent pour apprendre et suivre
            </div>

            <h2 className="mt-7 text-5xl font-bold tracking-[-0.055em] text-slate-950 xl:text-6xl">
              Reprenez votre parcours là où vous l’avez laissé.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Connectez-vous à votre espace étudiant ou professeur pour
              consulter les cours, passer les quiz, analyser les résultats et
              accéder aux recommandations générées par l’IA.
            </p>

            <div className="mt-9 grid grid-cols-1 gap-4">
              <div className="rounded-[2rem] border border-violet-100 bg-white/90 p-5 shadow-sm shadow-violet-100/40 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <BrainCircuit size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Diagnostic IA personnalisé
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Après chaque quiz, l’élève reçoit une analyse claire de
                      ses points forts, difficultés et compétences à renforcer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-5 shadow-sm shadow-emerald-100/30 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Accès sécurisé par rôle
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Les étudiants accèdent à leur parcours, tandis que les
                      professeurs suivent les résultats et l’analyse de classe.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-fuchsia-100 bg-white/90 p-5 shadow-sm shadow-fuchsia-100/30 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
                    <CheckCircle2 size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Recommandations adaptées
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Les exercices sont proposés selon les résultats et les
                      parties à renforcer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="mx-auto max-w-md lg:ml-auto lg:mr-0">
            <div className="relative">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-violet-200/35 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2.2rem] border border-violet-100 bg-white/90 p-5 shadow-2xl shadow-violet-100/60 backdrop-blur-2xl md:p-6">
                <div className="rounded-[1.8rem] border border-violet-100 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-8">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-600 shadow-sm">
                      <LockKeyhole size={27} />
                    </div>

                    <p className="text-sm font-bold text-violet-600">
                      Connexion
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                      Heureux de vous revoir.
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Connectez-vous à votre espace étudiant ou professeur.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled
                      className="flex items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm disabled:cursor-not-allowed disabled:opacity-80"
                      title="Connexion Google bientôt disponible"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-50 text-xs font-black text-violet-600">
                        G
                      </span>
                      Google
                    </button>

                    <button
                      type="button"
                      disabled
                      className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-80"
                      title="Connexion Apple bientôt disponible"
                    >
                      <span className="text-lg leading-none"></span>
                      Apple
                    </button>
                  </div>

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      ou avec email
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  {erreur && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
                      {erreur}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                          placeholder="exemple@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <label className="block text-sm font-bold text-slate-700">
                          Mot de passe
                        </label>

                        <span className="text-xs font-semibold text-slate-400">
                          Sécurisé
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                          placeholder="Votre mot de passe"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={chargement}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {chargement ? "Connexion en cours..." : "Se connecter"}
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
                      Pas encore de compte étudiant ?{" "}
                      <Link
                        to="/inscription"
                        className="font-bold text-violet-600 hover:text-violet-700"
                      >
                        Créer un compte
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-3xl bg-violet-50 p-4 text-center">
                    <p className="text-lg font-bold text-violet-700">IA</p>
                    <p className="mt-1 text-xs font-medium text-violet-600">
                      Analyse
                    </p>
                  </div>

                  <div className="rounded-3xl bg-emerald-50 p-4 text-center">
                    <p className="text-lg font-bold text-emerald-700">JWT</p>
                    <p className="mt-1 text-xs font-medium text-emerald-600">
                      Sécurité
                    </p>
                  </div>

                  <div className="rounded-3xl bg-fuchsia-50 p-4 text-center">
                    <p className="text-lg font-bold text-fuchsia-700">Web</p>
                    <p className="mt-1 text-xs font-medium text-fuchsia-600">
                      Mobile
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-6 text-slate-400">
              La connexion Google et Apple est affichée pour l’interface, mais
              sera activée dans une prochaine version.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;