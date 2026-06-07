import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import StudentNav from "../components/StudentNav";

type StudentResult = {
  _id: string;
  score: number;
  niveauDetecte: "weak" | "medium" | "strong";
  bonnesReponses: number;
  totalQuestions: number;
  tentative?: number;
  createdAt: string;
  updatedAt: string;
  quiz?: {
    titre: string;
    difficulte: "easy" | "medium" | "hard";
  };
  course?: {
    titre: string;
    matiere: string;
    niveau: string;
  };
};

const niveauLabel = {
  weak: "À renforcer",
  medium: "Moyen",
  strong: "Solide",
};

const difficulteLabel = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

function StudentResultsPage() {
  const navigate = useNavigate();

  const [results, setResults] = useState<StudentResult[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get("/results/me");
        setResults(response.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement de vos résultats"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {chargement && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Chargement de vos résultats...
          </div>
        )}

        {erreur && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {erreur}
          </div>
        )}

        {!chargement && !erreur && results.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Aucun résultat disponible
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Vos résultats apparaîtront ici après avoir terminé un quiz.
            </p>
          </div>
        )}

        {!chargement && !erreur && results.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {results.map((result) => (
              <div
                key={result._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      {result.course?.matiere} · {result.course?.niveau}
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      {result.quiz?.titre}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Cours : {result.course?.titre}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {result.score}%
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Niveau détecté</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {niveauLabel[result.niveauDetecte]}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Difficulté</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {result.quiz?.difficulte
                        ? difficulteLabel[result.quiz.difficulte]
                        : "Non définie"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Bonnes réponses</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {result.bonnesReponses}/{result.totalQuestions}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Tentatives</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {result.tentative || 1}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/etudiant/recommandations")}
                  className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Voir les recommandations
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentResultsPage;