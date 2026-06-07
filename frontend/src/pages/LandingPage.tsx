import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-blue-400">
              Plateforme d’apprentissage
            </p>
            <h1 className="text-lg font-bold text-white">
              Démo éducative adaptive
            </h1>
          </div>

          <div className="flex gap-3">
            <Link
              to="/connexion"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Connexion
            </Link>

            <Link
              to="/inscription"
              className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-300">
              Mathématiques · Collège · Exercices adaptatifs
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Une plateforme moderne pour suivre et adapter l’apprentissage.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Les élèves accèdent aux cours attribués par leur professeur,
              passent des quiz, obtiennent un score et reçoivent des exercices
              recommandés selon leur niveau.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/connexion"
                className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600"
              >
                Se connecter
              </Link>

              <Link
                to="/inscription"
                className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Créer un compte étudiant
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="rounded-2xl bg-white p-6 text-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Résultat du quiz
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">
                    Équations du premier degré
                  </h3>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  Solide
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Score</p>
                  <p className="mt-1 text-2xl font-bold">85%</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Quiz</p>
                  <p className="mt-1 text-2xl font-bold">12</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Tentatives</p>
                  <p className="mt-1 text-2xl font-bold">3</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Recommandation
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Continuer avec des exercices difficiles pour renforcer la
                  maîtrise.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 py-12 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-bold text-white">Espace étudiant</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Accès aux cours autorisés, quiz, scores, résultats et
                recommandations adaptées.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-bold text-white">Espace professeur</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Création de cours, quiz, gestion des accès et suivi des
                résultats des élèves.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-bold text-white">Adaptation automatique</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Les recommandations sont générées selon le score et le niveau
                détecté.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;