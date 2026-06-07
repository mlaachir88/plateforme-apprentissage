import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import TeacherNav from "../components/TeacherNav";


type LatestResult = {
  _id: string;
  score: number;
  niveauDetecte: string;
  tentative: number;
  student?: {
    prenom: string;
    nom: string;
    email: string;
    niveauScolaire: string;
    classe: string;
  };
  quiz?: {
    titre: string;
    difficulte: string;
  };
  course?: {
    titre: string;
    matiere: string;
  };
};

type DashboardData = {
  coursesCount: number;
  quizzesCount: number;
  studentsCount: number;
  resultsCount: number;
  averageScore: number;
  latestResults: LatestResult[];
};

function TeacherDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");


  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/teacher");
        setData(response.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement du tableau de bord"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Tableau de bord
          </h2>
          <div className="mt-4 flex gap-3">
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/professeur/cours/nouveau"
              className="inline-flex rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Créer un cours
            </Link>

            <Link
              to="/professeur/quiz/nouveau"
              className="inline-flex rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Créer un quiz
            </Link>

            <Link
              to="/professeur/cours/acces"
              className="inline-flex rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Donner accès
            </Link>

            <Link
              to="/professeur/resultats"
              className="inline-flex rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Voir les résultats
            </Link>

            <Link
              to="/professeur/cours"
              className="inline-flex rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Mes cours
            </Link>
            <Link
              to="/professeur/quiz"
              className="inline-flex rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Mes quiz
            </Link>
          </div>
        </div>
        </div>
        

        {chargement && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Chargement du tableau de bord...
          </div>
        )}

        {erreur && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {erreur}
          </div>
        )}

        {!chargement && !erreur && data && (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Cours</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {data.coursesCount}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Quiz</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {data.quizzesCount}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Étudiants</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {data.studentsCount}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Résultats</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {data.resultsCount}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Moyenne</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {data.averageScore}%
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h3 className="font-semibold text-slate-900">
                  Derniers résultats
                </h3>
              </div>

              {data.latestResults.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  Aucun résultat pour le moment.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {data.latestResults.map((result) => (
                    <div
                      key={result._id}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {result.student?.prenom} {result.student?.nom}
                        </p>
                        <p className="text-sm text-slate-500">
                          {result.course?.titre} · {result.quiz?.titre}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {result.score}%
                        </p>
                        <p className="text-sm text-slate-500">
                          Niveau : {result.niveauDetecte}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default TeacherDashboardPage;