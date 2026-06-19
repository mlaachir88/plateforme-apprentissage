import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  LineChart,
  LockKeyhole,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute right-[-180px] top-[220px] h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-[-220px] left-[-120px] h-[480px] w-[480px] rounded-full bg-emerald-200/35 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-sm shadow-blue-100/60 transition group-hover:scale-105">
              <GraduationCap size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold leading-none text-blue-600">
                Plateforme d’apprentissage
              </p>
              <h1 className="mt-1 text-base font-bold tracking-tight text-slate-950">
                Démo éducative adaptive
              </h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#fonctionnalites" className="hover:text-slate-950">
              Fonctionnalités
            </a>
            <a href="#ia" className="hover:text-slate-950">
              Intelligence IA
            </a>
            <a href="#espaces" className="hover:text-slate-950">
              Espaces
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/connexion"
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Connexion
            </Link>

            <Link
              to="/inscription"
              className="hidden rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 sm:inline-flex"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-5 pb-12 pt-14 md:px-8 md:pb-20 md:pt-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60 backdrop-blur-xl">
                <Sparkles size={16} />
                Mathématiques · Collège · IA adaptative
              </div>

              <h2 className="mt-7 max-w-4xl text-5xl font-bold tracking-[-0.055em] text-slate-950 md:text-6xl lg:text-7xl">
                Une expérience claire pour apprendre selon son niveau.
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl md:leading-9">
                Les élèves consultent les cours, passent un quiz diagnostique,
                reçoivent une analyse personnalisée et travaillent sur des
                exercices adaptés à leurs difficultés.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/connexion"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Se connecter
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  to="/inscription"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                >
                  Créer un compte étudiant
                </Link>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
                  <p className="text-2xl font-bold tracking-tight text-slate-950">
                    IA
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Diagnostic personnalisé
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
                  <p className="text-2xl font-bold tracking-tight text-slate-950">
                    2
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Espaces dédiés
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
                  <p className="text-2xl font-bold tracking-tight text-slate-950">
                    100%
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Web responsive
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-blue-200/60 via-indigo-100/60 to-emerald-100/60 blur-2xl" />

              <div className="relative rounded-[2rem] border border-white bg-white/75 p-4 shadow-2xl shadow-slate-200/80 backdrop-blur-2xl md:p-5">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            <BrainCircuit size={14} />
                            Analyse IA
                          </div>

                          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                            Équations du premier degré
                          </h3>

                          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Diagnostic calculé à partir des réponses de
                            l’élève.
                          </p>
                        </div>

                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          Solide
                        </span>
                      </div>

                      <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-medium text-slate-500">
                            Score
                          </p>
                          <p className="mt-1 text-2xl font-bold text-slate-950">
                            85%
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-medium text-slate-500">
                            Quiz
                          </p>
                          <p className="mt-1 text-2xl font-bold text-slate-950">
                            12
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-medium text-slate-500">
                            Tentatives
                          </p>
                          <p className="mt-1 text-2xl font-bold text-slate-950">
                            3
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 rounded-[1.35rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm md:col-span-7">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                          <Target size={20} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-950">
                            Partie à renforcer
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Résoudre a/x = b
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 h-2 rounded-full bg-white">
                        <div className="h-2 w-[72%] rounded-full bg-blue-600" />
                      </div>
                    </div>

                    <div className="col-span-12 rounded-[1.35rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm md:col-span-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                        <CheckCircle2 size={20} />
                      </div>

                      <p className="mt-4 text-sm font-bold text-slate-950">
                        Recommandation
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Continuer avec des exercices ciblés pour renforcer la
                        maîtrise.
                      </p>
                    </div>

                    <div className="col-span-12 rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-950">
                            Progression hebdomadaire
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Suivi pédagogique automatique
                          </p>
                        </div>

                        <LineChart size={22} className="text-slate-400" />
                      </div>

                      <div className="mt-5 flex items-end gap-2">
                        {[35, 48, 42, 60, 72, 68, 85].map((height, index) => (
                          <div
                            key={index}
                            className="flex flex-1 items-end rounded-full bg-slate-100"
                            style={{ height: "82px" }}
                          >
                            <div
                              className="w-full rounded-full bg-gradient-to-t from-blue-600 to-blue-300"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="fonctionnalites" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
              <Sparkles size={16} className="text-blue-600" />
              Fonctionnalités principales
            </div>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Une plateforme pensée pour accompagner chaque élève.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Le système combine diagnostic, suivi, recommandations et analyse
              pédagogique dans une interface simple et agréable.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-6">
            <article className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 md:col-span-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <BookOpen size={24} />
              </div>

              <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                Cours structurés
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Les élèves accèdent aux contenus autorisés par le professeur,
                avec une organisation claire par parties et notions.
              </p>

              <div className="mt-6 rounded-3xl bg-slate-50 p-4">
                <div className="h-3 w-4/5 rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-3/5 rounded-full bg-slate-200" />
                <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="h-3 w-1/2 rounded-full bg-blue-200" />
                  <div className="mt-3 h-3 w-full rounded-full bg-slate-200" />
                  <div className="mt-2 h-3 w-4/6 rounded-full bg-slate-200" />
                </div>
              </div>
            </article>

            <article className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 md:col-span-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <BarChart3 size={24} />
              </div>

              <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                Quiz diagnostique
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Chaque quiz permet d’identifier le niveau, les acquis et les
                difficultés de l’élève à partir de ses réponses.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-3xl bg-emerald-50 p-4">
                  <p className="text-xs font-bold text-emerald-700">Score</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">76%</p>
                </div>

                <div className="rounded-3xl bg-blue-50 p-4">
                  <p className="text-xs font-bold text-blue-700">Niveau</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">Bon</p>
                </div>

                <div className="rounded-3xl bg-indigo-50 p-4">
                  <p className="text-xs font-bold text-indigo-700">IA</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">On</p>
                </div>
              </div>
            </article>

            <article
              id="ia"
              className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-7 shadow-sm md:col-span-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <BrainCircuit size={24} />
              </div>

              <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                Intelligence artificielle intégrée
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                L’IA génère un commentaire pédagogique, une synthèse des
                difficultés, des recommandations adaptées et des explications
                personnalisées après les erreurs.
              </p>

              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-blue-100 bg-white/80 p-5">
                  <p className="text-sm font-bold text-slate-950">
                    Diagnostic étudiant
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Analyse par partie, compétences faibles et conseils de
                    révision.
                  </p>
                </div>

                <div className="rounded-3xl border border-blue-100 bg-white/80 p-5">
                  <p className="text-sm font-bold text-slate-950">
                    Analyse professeur
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Plan d’action pédagogique et élèves à accompagner.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:col-span-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <LockKeyhole size={24} />
              </div>

              <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                Accès sécurisé
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Authentification JWT, rôles professeur/étudiant et accès aux
                cours contrôlés.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <p className="text-sm font-semibold text-slate-700">
                    Comptes sécurisés
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <p className="text-sm font-semibold text-slate-700">
                    Accès par rôle
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="espaces" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                  <GraduationCap size={27} />
                </div>

                <div>
                  <p className="text-sm font-bold text-blue-600">
                    Espace étudiant
                  </p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    Apprendre avec un parcours adapté.
                  </h3>
                </div>
              </div>

              <div className="mt-7 space-y-4">
                {[
                  "Accéder aux cours autorisés par le professeur.",
                  "Passer un quiz diagnostique.",
                  "Recevoir un score et un niveau détecté.",
                  "Comprendre les erreurs avec des explications IA.",
                  "Refaire des exercices recommandés.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4"
                  >
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />
                    <p className="text-sm font-medium leading-6 text-slate-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                  <Users size={27} />
                </div>

                <div>
                  <p className="text-sm font-bold text-emerald-600">
                    Espace professeur
                  </p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    Suivre la classe avec précision.
                  </h3>
                </div>
              </div>

              <div className="mt-7 space-y-4">
                {[
                  "Créer les cours et les quiz.",
                  "Gérer l’accès des élèves.",
                  "Consulter les résultats et scores.",
                  "Identifier les parties faibles de la classe.",
                  "Recevoir un plan d’action pédagogique généré par IA.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4"
                  >
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <p className="text-sm font-medium leading-6 text-slate-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 pt-8 md:px-8 md:pb-24">
          <div className="overflow-hidden rounded-[2.3rem] border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-300/40">
            <div className="relative px-7 py-12 text-center md:px-12 md:py-16">
              <div className="absolute left-1/2 top-[-220px] h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl" />

              <div className="relative z-10 mx-auto max-w-3xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-blue-200 ring-1 ring-white/10">
                  <Sparkles size={27} />
                </div>

                <h2 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
                  Une plateforme simple, intelligente et prête à être testée.
                </h2>

                <p className="mt-5 text-lg leading-8 text-slate-300">
                  Connectez-vous pour découvrir l’espace étudiant ou créer un
                  compte afin d’explorer le fonctionnement de la plateforme.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    to="/connexion"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
                  >
                    Se connecter
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    to="/inscription"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-medium text-slate-600">
            Plateforme d’apprentissage adaptative
          </p>

          <p>
            Mathématiques · Collège · Diagnostic IA · Recommandations
            personnalisées
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;