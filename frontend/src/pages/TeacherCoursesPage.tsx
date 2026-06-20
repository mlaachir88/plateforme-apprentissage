import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Eye,
  FileText,
  GraduationCap,
  Layers,
  ListChecks,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Users,
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

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

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

  const totalQuizzes = useMemo(() => {
    return courses.reduce((sum, course) => sum + course.quizCount, 0);
  }, [courses]);

  const totalStudents = useMemo(() => {
    return courses.reduce(
      (sum, course) => sum + (course.etudiantsAutorises?.length || 0),
      0
    );
  }, [courses]);

  const coursesWithPdf = useMemo(() => {
    return courses.filter((course) => course.pdfUrl).length;
  }, [courses]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbf8ff] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute right-[-220px] top-[260px] h-[460px] w-[460px] rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="absolute bottom-[-240px] left-[-160px] h-[500px] w-[500px] rounded-full bg-amber-100/35 blur-3xl" />
      </div>

      <TeacherNav />

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-6 rounded-[2.4rem] border border-violet-100 bg-white/90 p-6 shadow-xl shadow-violet-100/40 backdrop-blur-2xl md:p-8">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                <BookOpen size={16} />
                Gestion des cours
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
                Mes cours pédagogiques
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Consultez vos cours, gérez les étudiants autorisés et suivez les
                quiz associés à chaque contenu pédagogique.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/professeur/cours/nouveau")}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                >
                  <PlusCircle size={18} />
                  Créer un cours
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-0.5"
                  />
                </button>

                <button
                  onClick={() => navigate("/professeur/cours/acces")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                >
                  <ShieldCheck size={18} />
                  Gérer les accès
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-violet-700">
                      Cours créés
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : courses.length}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm">
                    <BookOpen size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-fuchsia-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-fuchsia-700">
                      Quiz associés
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : totalQuizzes}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 shadow-sm">
                    <ListChecks size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-emerald-700">
                      Accès étudiants
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : totalStudents}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
                    <Users size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {chargement && (
          <section className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Clock3 size={23} />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Chargement des cours...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous récupérons vos contenus pédagogiques.
                </p>
              </div>
            </div>
          </section>
        )}

        {erreur && (
          <section className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <p className="font-bold">Une erreur est survenue</p>
            <p className="mt-2 text-sm leading-6">{erreur}</p>
          </section>
        )}

        {!chargement && !erreur && courses.length === 0 && (
          <section className="rounded-[2.3rem] border border-violet-100 bg-white/95 p-10 text-center shadow-xl shadow-violet-100/40 backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-violet-50 text-violet-600 shadow-sm">
              <BookOpen size={40} />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Aucun cours créé
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              Créez votre premier cours pour organiser vos contenus, préparer
              des quiz et donner accès aux étudiants.
            </p>

            <button
              onClick={() => navigate("/professeur/cours/nouveau")}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              <PlusCircle size={18} />
              Créer un cours
            </button>
          </section>
        )}

        {!chargement && !erreur && courses.length > 0 && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {courses.map((course) => (
                <article
                  key={course._id}
                  className="group overflow-hidden rounded-[2.2rem] border border-violet-100 bg-white/95 shadow-lg shadow-violet-100/25 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-100/50"
                >
                  <div className="border-b border-violet-100 bg-violet-50/60 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                          <BookOpen size={28} />
                        </div>

                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full border border-violet-100 bg-white px-3 py-1 text-xs font-bold text-violet-700">
                              <GraduationCap size={13} />
                              {course.matiere}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-white px-3 py-1 text-xs font-bold text-slate-600">
                              {course.niveau}
                            </span>
                          </div>

                          <h3 className="mt-3 line-clamp-2 text-xl font-bold tracking-tight text-slate-950">
                            {course.titre}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-violet-100 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
                          <ListChecks size={15} />
                          Quiz
                        </div>

                        <p className="mt-2 text-2xl font-bold text-slate-950">
                          {course.quizCount}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                          <Users size={15} />
                          Étudiants
                        </div>

                        <p className="mt-2 text-2xl font-bold text-slate-950">
                          {course.etudiantsAutorises?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                        <FileText size={13} />
                        {course.pdfUrl ? "Texte + PDF" : "Texte"}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                        Créé le {formatDate(course.createdAt)}
                      </span>
                    </div>

                    <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                      {course.description || "Aucune description renseignée."}
                    </p>

                    <div className="mt-5 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
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
                          {course.etudiantsAutorises
                            .slice(0, 4)
                            .map((student) => (
                              <span
                                key={student._id}
                                className="rounded-full border border-violet-100 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                              >
                                {student.prenom} {student.nom} ·{" "}
                                {student.classe}
                              </span>
                            ))}

                          {course.etudiantsAutorises.length > 4 && (
                            <span className="rounded-full border border-slate-100 bg-white px-3 py-2 text-sm font-bold text-slate-500">
                              +{course.etudiantsAutorises.length - 4} autre(s)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <button
                        onClick={() =>
                          navigate(`/professeur/cours/${course._id}`)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                      >
                        <Eye size={17} />
                        Voir
                      </button>

                      <button
                        onClick={() => navigate("/professeur/cours/acces")}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50"
                      >
                        <Users size={17} />
                        Accès
                      </button>

                      <button
                        onClick={() => navigate("/professeur/quiz/nouveau")}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-100 bg-fuchsia-50 px-4 py-3 text-sm font-bold text-fuchsia-700 transition hover:-translate-y-0.5 hover:bg-fuchsia-100"
                      >
                        <PlusCircle size={17} />
                        Quiz
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <Sparkles size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        Résumé des cours
                      </h3>
                      <p className="text-sm text-slate-500">
                        Vue rapide.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                      <p className="text-xs font-bold text-violet-700">
                        Total cours
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {courses.length}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 p-4">
                      <p className="text-xs font-bold text-fuchsia-700">
                        Total quiz
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {totalQuizzes}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-bold text-emerald-700">
                        Accès étudiants
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {totalStudents}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs font-bold text-amber-700">
                        Avec PDF
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {coursesWithPdf}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <Layers size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        Actions rapides
                      </h3>
                      <p className="text-sm text-slate-500">
                        Continuer le travail.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <button
                      onClick={() => navigate("/professeur/cours/nouveau")}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      Créer un cours
                      <ArrowRight size={16} />
                    </button>

                    <button
                      onClick={() => navigate("/professeur/quiz/nouveau")}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      Créer un quiz
                      <ArrowRight size={16} />
                    </button>

                    <button
                      onClick={() => navigate("/professeur/cours/acces")}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      Gérer les accès
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

export default TeacherCoursesPage;