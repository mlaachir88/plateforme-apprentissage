import { useEffect, useState } from "react";
import api from "../api/axios";
import TeacherNav from "../components/TeacherNav";


type Result = {
  _id: string;
  score: number;
  niveauDetecte: "weak" | "medium" | "strong";
  bonnesReponses: number;
  totalQuestions: number;
  tentative?: number;
  createdAt: string;
  updatedAt: string;
  student?: {
    prenom: string;
    nom: string;
    email: string;
    niveauScolaire: string;
    classe: string;
  };
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

function TeacherResultsPage() {
  

  const [results, setResults] = useState<Result[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get("/results/teacher");
        setResults(response.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement des résultats"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {chargement && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Chargement des résultats...
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
              Les résultats apparaîtront ici après le passage des quiz par les étudiants.
            </p>
          </div>
        )}

        {!chargement && !erreur && results.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Suivi pédagogique
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Vue globale des résultats sur vos cours.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Étudiant</th>
                    <th className="px-6 py-4 font-medium">Classe</th>
                    <th className="px-6 py-4 font-medium">Cours</th>
                    <th className="px-6 py-4 font-medium">Quiz</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium">Niveau</th>
                    <th className="px-6 py-4 font-medium">Tentative</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {results.map((result) => (
                    <tr key={result._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {result.student?.prenom} {result.student?.nom}
                        </p>
                        <p className="text-xs text-slate-500">
                          {result.student?.email}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {result.student?.niveauScolaire} ·{" "}
                        {result.student?.classe}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {result.course?.titre}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {result.quiz?.titre}
                        <p className="text-xs text-slate-400">
                          {result.quiz?.difficulte
                            ? difficulteLabel[result.quiz.difficulte]
                            : ""}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                          {result.score}%
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {niveauLabel[result.niveauDetecte]}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {result.tentative || 1}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TeacherResultsPage;