import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Layers,
  LibraryBig,
  ListChecks,
  PlayCircle,
} from "lucide-react";

import api from "../api/axios";
import StudentNav from "../components/StudentNav";

type Course = {
  _id: string;
  titre: string;
  description: string;
  niveau: string;
  matiere: string;
  contenuTexte: string;
  pdfUrl?: string;
};

type CourseWithStats = Course & {
  quizCount: number;
};

const gradients = [
  "from-blue-500 via-indigo-500 to-violet-600",
  "from-cyan-500 via-blue-500 to-indigo-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
];

function StudentDashboardPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        const coursesData: Course[] = response.data;

        const coursesWithStats = await Promise.all(
          coursesData.map(async (course) => {
            const quizzesResponse = await api.get(
              `/quizzes/course/${course._id}`
            );

            return {
              ...course,
              quizCount: quizzesResponse.data.length,
            };
          })
        );

        setCourses(coursesWithStats);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors de la récupération des cours"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                <GraduationCap size={16} />
                Espace d’apprentissage
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Mes cours
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Retrouvez les cours auxquels votre professeur vous a donné accès,
                consultez les supports disponibles et commencez vos quiz.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/etudiant/recommandations")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Layers size={18} />
                Recommandations
              </button>

              <button
                onClick={() => navigate("/etudiant/resultats")}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <ListChecks size={18} />
                Mes résultats
              </button>
            </div>
          </div>
        </section>

        {chargement && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
            Chargement des cours...
          </div>
        )}

        {erreur && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {erreur}
          </div>
        )}

        {!chargement && !erreur && courses.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <LibraryBig size={32} />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              Aucun cours disponible
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Votre professeur ne vous a pas encore donné accès à un cours.
            </p>
          </div>
        )}

        {!chargement && !erreur && courses.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => {
              const gradient = gradients[index % gradients.length];

              return (
                <article
                  key={course._id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`relative h-40 bg-gradient-to-br ${gradient}`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_35%)]" />

                    <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      <ListChecks size={14} />
                      {course.quizCount} quiz
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                          <BookOpen size={26} />
                        </div>

                        <div>
                          <p className="text-xs font-medium text-white/85">
                            {course.matiere}
                          </p>

                          <p className="text-sm font-bold text-white">
                            {course.niveau}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        <BookOpen size={13} />
                        Cours
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        <FileText size={13} />
                        {course.pdfUrl ? "Texte + PDF" : "Texte"}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                      {course.titre}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {course.description}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FileText size={15} />
                          Contenu
                        </div>

                        <p className="mt-2 font-semibold text-slate-900">
                          {course.pdfUrl ? "PDF + texte" : "Texte"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <ListChecks size={15} />
                          Quiz
                        </div>

                        <p className="mt-2 font-semibold text-slate-900">
                          {course.quizCount}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/etudiant/cours/${course._id}`)}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Voir le cours
                      <PlayCircle size={18} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentDashboardPage;