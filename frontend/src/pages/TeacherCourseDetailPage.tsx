import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  GraduationCap,
  ListChecks,
  PlusCircle,
  ShieldCheck,
  Users,
} from "lucide-react";

import api from "../api/axios";
import TeacherNav from "../components/TeacherNav";
import MathContent from "../components/MathContent";

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
};

type Quiz = {
  _id: string;
  titre: string;
  description: string;
  difficulte: "easy" | "medium" | "hard";
  questions: {
    _id: string;
    question: string;
    choix: string[];
  }[];
};

const difficulteLabel = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

const difficultyStyle = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-rose-50 text-rose-700 border-rose-200",
};

function TeacherCourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const coursesResponse = await api.get("/courses");

        const selectedCourse = coursesResponse.data.find(
          (item: Course) => item._id === courseId
        );

        if (!selectedCourse) {
          setErreur("Cours introuvable");
          return;
        }

        setCourse(selectedCourse);

        const quizzesResponse = await api.get(`/quizzes/course/${courseId}`);
        setQuizzes(quizzesResponse.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement du cours"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {chargement && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
            Chargement du cours...
          </div>
        )}

        {erreur && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {erreur}

            <button
              onClick={() => navigate("/professeur/cours")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <ArrowLeft size={17} />
              Retour aux cours
            </button>
          </div>
        )}

        {!chargement && !erreur && course && (
          <>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-10 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.35),transparent_35%)]" />

                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                      <GraduationCap size={16} />
                      {course.matiere} · {course.niveau}
                    </div>

                    <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
                      {course.titre}
                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate("/professeur/cours")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                    >
                      <ArrowLeft size={17} />
                      Retour
                    </button>

                    <button
                      onClick={() => navigate("/professeur/cours/acces")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
                    >
                      <Users size={17} />
                      Gérer les accès
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                    <ListChecks size={18} />
                    Quiz associés
                  </div>

                  <p className="mt-3 text-3xl font-bold text-blue-800">
                    {quizzes.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Users size={18} />
                    Étudiants autorisés
                  </div>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {course.etudiantsAutorises?.length || 0}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <FileText size={18} />
                    Type de contenu
                  </div>

                  <p className="mt-3 text-lg font-bold text-slate-900">
                    {course.pdfUrl ? "Texte + PDF" : "Texte"}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <BookOpen size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Contenu du cours
                    </h2>

                    <p className="text-sm text-slate-500">
                      Support pédagogique visible par les étudiants autorisés.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-700">
                  {course.contenuTexte ? (
                    <MathContent content={course.contenuTexte} />
                  ) : (
                    "Aucun contenu texte disponible."
                  )}
                </div>
              </div>

              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <ShieldCheck size={23} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Accès étudiants
                    </h2>

                    <p className="text-sm text-slate-500">
                      Étudiants qui peuvent consulter ce cours.
                    </p>
                  </div>
                </div>

                {!course.etudiantsAutorises ||
                course.etudiantsAutorises.length === 0 ? (
                  <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                    Aucun étudiant n’a encore accès à ce cours.
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {course.etudiantsAutorises.map((student) => (
                      <div
                        key={student._id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <p className="font-semibold text-slate-900">
                          {student.prenom} {student.nom}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {student.email}
                        </p>

                        <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {student.niveauScolaire} · {student.classe}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => navigate("/professeur/cours/acces")}
                  className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Modifier les accès
                </button>
              </aside>
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    <ListChecks size={16} />
                    Évaluations
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    Quiz du cours
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Liste des quiz associés à ce cours.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/professeur/quiz/nouveau")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <PlusCircle size={18} />
                  Ajouter un quiz
                </button>
              </div>

              {quizzes.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                  Aucun quiz n’a encore été créé pour ce cours.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {quizzes.map((quiz) => (
                    <article
                      key={quiz._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          difficultyStyle[quiz.difficulte]
                        }`}
                      >
                        {difficulteLabel[quiz.difficulte]}
                      </span>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {quiz.titre}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {quiz.description || "Quiz d’entraînement"}
                      </p>

                      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Questions</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {quiz.questions.length} question(s)
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(`/professeur/quiz/${quiz._id}`)}
                        className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Voir le quiz
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default TeacherCourseDetailPage;