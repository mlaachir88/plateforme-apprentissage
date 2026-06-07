import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  FileText,
  ListChecks,
  PlusCircle,
  ShieldCheck,
  Users,
  Eye,
} from "lucide-react";

import api from "../api/axios";
import TeacherNav from "../components/TeacherNav";

type Student = {
  _id: string;
  prenom: string;
  nom: string;
  email: string;
  niveauScolaire: string;
  classe: string;
};

type Course = {
  _id: string;
  titre: string;
  description: string;
  niveau: string;
  matiere: string;
  contenuTexte: string;
  pdfUrl?: string;
  etudiantsAutorises?: Student[];
  createdAt: string;
};

type CourseWithStats = Course & {
  quizCount: number;
};

const gradients = [
  "from-blue-500 via-indigo-500 to-violet-600",
  "from-cyan-500 via-blue-500 to-indigo-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
];

function TeacherCoursesPage() {
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
            "Erreur lors du chargement des cours"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                <BookOpen size={16} />
                Gestion des cours
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Mes cours
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Consultez vos cours, gérez les étudiants autorisés et suivez les
                quiz associés à chaque contenu pédagogique.
              </p>
            </div>

            <button
              onClick={() => navigate("/professeur/cours/nouveau")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <PlusCircle size={18} />
              Créer un cours
            </button>
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
              <BookOpen size={32} />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              Aucun cours créé
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Créez votre premier cours pour commencer à organiser vos quiz.
            </p>

            <button
              onClick={() => navigate("/professeur/cours/nouveau")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <PlusCircle size={18} />
              Créer un cours
            </button>
          </div>
        )}

        {!chargement && !erreur && courses.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {courses.map((course, index) => {
              const gradient = gradients[index % gradients.length];

              return (
                <article
                  key={course._id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_35%)]" />

                    <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      <ListChecks size={14} />
                      {course.quizCount} quiz
                    </div>

                    <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      <Users size={14} />
                      {course.etudiantsAutorises?.length || 0} étudiant(s)
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
                          <ListChecks size={15} />
                          Quiz associés
                        </div>

                        <p className="mt-2 text-xl font-bold text-slate-900">
                          {course.quizCount}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Users size={15} />
                          Étudiants
                        </div>

                        <p className="mt-2 text-xl font-bold text-slate-900">
                          {course.etudiantsAutorises?.length || 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <ShieldCheck size={16} />
                        Étudiants autorisés
                      </div>

                      {!course.etudiantsAutorises ||
                      course.etudiantsAutorises.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">
                          Aucun étudiant autorisé pour le moment.
                        </p>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {course.etudiantsAutorises.map((student) => (
                            <span
                              key={student._id}
                              className="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700"
                            >
                              {student.prenom} {student.nom} · {student.classe}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <button
                        onClick={() =>
                          navigate(`/professeur/cours/${course._id}`)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        <Eye size={17} />
                        Voir
                      </button>

                      <button
                        onClick={() => navigate("/professeur/cours/acces")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Users size={17} />
                        Accès
                      </button>

                      <button
                        onClick={() => navigate("/professeur/quiz/nouveau")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <PlusCircle size={17} />
                        Quiz
                      </button>
                    </div>
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

export default TeacherCoursesPage;