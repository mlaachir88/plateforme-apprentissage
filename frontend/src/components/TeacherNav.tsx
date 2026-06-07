import { useNavigate } from "react-router-dom";

function TeacherNav() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/connexion");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Plateforme d’apprentissage
          </p>

          <h1 className="text-2xl font-bold text-slate-900">
            Espace professeur
          </h1>
        </div>

        <nav className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/professeur")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Tableau de bord
          </button>

          <button
            onClick={() => navigate("/professeur/cours")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Mes cours
          </button>

          <button
            onClick={() => navigate("/professeur/quiz")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Mes quiz
          </button>

          <button
            onClick={() => navigate("/professeur/cours/acces")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Accès
          </button>

          <button
            onClick={() => navigate("/professeur/resultats")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Résultats
          </button>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Déconnexion
          </button>
        </nav>
      </div>
    </header>
  );
}

export default TeacherNav;