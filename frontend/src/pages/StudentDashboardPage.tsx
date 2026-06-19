import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Clock3,
  FileText,
  GraduationCap,
  Layers,
  LibraryBig,
  ListChecks,
  PlayCircle,
  Sparkles,
  Target,
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

const courseStyles = [
  {
    accent: "bg-violet-600",
    soft: "bg-violet-50",
    border: "border-violet-100",
    text: "text-violet-700",
    icon: "text-violet-600",
  },
  {
    accent: "bg-fuchsia-600",
    soft: "bg-fuchsia-50",
    border: "border-fuchsia-100",
    text: "text-fuchsia-700",
    icon: "text-fuchsia-600",
  },
  {
    accent: "bg-amber-500",
    soft: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
    icon: "text-amber-600",
  },
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

  const totalQuiz = courses.reduce(
    (total, course) => total + course.quizCount,
    0
  );

  const coursesAvecPdf = courses.filter((course) => course.pdfUrl).length;

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbf8ff] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute right-[-220px] top-[260px] h-[460px] w-[460px] rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="absolute bottom-[-240px] left-[-160px] h-[500px] w-[500px] rounded-full bg-amber-100/35 blur-3xl" />
      </div>

      <StudentNav />

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-8 rounded-[2.4rem] border border-violet-100 bg-white/90 p-6 shadow-xl shadow-violet-100/40 backdrop-blur-2xl md:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                <GraduationCap size={16} />
                Espace d’apprentissage
              </div>

              <h2 className="mt-5 max-w-3xl text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl">
                Vos cours, vos quiz et votre progression au même endroit.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                Retrouvez les cours auxquels votre professeur vous a donné
                accès, consultez les supports disponibles et commencez vos quiz
                diagnostiques ou d’entraînement.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/etudiant/recommandations")}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                >
                  <Layers size={18} />
                  Recommandations
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-0.5"
                  />
                </button>

                <button
                  onClick={() => navigate("/etudiant/resultats")}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                >
                  <ListChecks size={18} />
                  Mes résultats
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-violet-700">
                      Cours disponibles
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
                      Quiz proposés
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : totalQuiz}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 shadow-sm">
                    <ListChecks size={24} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-amber-700">
                      Supports PDF
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                      {chargement ? "..." : coursesAvecPdf}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
                    <FileText size={24} />
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
                  Nous récupérons les cours autorisés par votre professeur.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-80 animate-pulse rounded-[2rem] border border-slate-100 bg-slate-50"
                />
              ))}
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
          <section className="rounded-[2.3rem] border border-violet-100 bg-white/90 p-10 text-center shadow-xl shadow-violet-100/40 backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-violet-50 text-violet-600 shadow-sm">
              <LibraryBig size={38} />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-slate-950">
              Aucun cours disponible
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              Votre professeur ne vous a pas encore donné accès à un cours.
              Dès qu’un cours sera autorisé, il apparaîtra ici.
            </p>
          </section>
        )}

        {!chargement && !erreur && courses.length > 0 && (
          <section>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-bold text-violet-700 shadow-sm">
                  <Sparkles size={16} />
                  Bibliothèque personnelle
                </div>

                <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                  Mes cours disponibles
                </h3>
              </div>

              <p className="max-w-md text-sm leading-6 text-slate-500">
                Chaque carte contient le support du cours, le nombre de quiz et
                un accès direct au contenu.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course, index) => {
                const style = courseStyles[index % courseStyles.length];

                return (
                  <article
                    key={course._id}
                    className="group overflow-hidden rounded-[2.2rem] border border-violet-100 bg-white/95 shadow-lg shadow-violet-100/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-violet-100/60"
                  >
                    <div className="relative border-b border-slate-100 bg-white p-6">

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 shadow-sm">
                          <BookOpen size={28} />
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
                            <ListChecks size={14} />
                            {course.quizCount} quiz
                          </span>

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${style.soft} ${style.border} ${style.text}`}
                          >
                            {course.pdfUrl ? "PDF + Texte" : "Texte"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <p className={`text-sm font-bold ${style.text}`}>
                          {course.matiere}
                        </p>

                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {course.niveau}
                        </p>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="line-clamp-2 text-xl font-bold tracking-tight text-slate-950">
                        {course.titre}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">
                        {course.description}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div
                          className={`rounded-3xl border p-4 ${style.soft} ${style.border}`}
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <FileText size={15} />
                            Contenu
                          </div>

                          <p className="mt-2 font-bold text-slate-950">
                            {course.pdfUrl ? "PDF + texte" : "Texte"}
                          </p>
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Target size={15} />
                            Quiz
                          </div>

                          <p className="mt-2 font-bold text-slate-950">
                            {course.quizCount}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-3xl border border-violet-100 bg-violet-50/60 p-4">
                        <div className="flex items-start gap-3">
                          <BrainCircuit
                            size={20}
                            className="mt-0.5 shrink-0 text-violet-600"
                          />

                          <p className="text-sm leading-6 text-slate-600">
                            Commencez par consulter le cours, puis passez le
                            quiz pour obtenir une analyse adaptée.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/etudiant/cours/${course._id}`)
                        }
                        className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                      >
                        Voir le cours
                        <PlayCircle
                          size={18}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default StudentDashboardPage;