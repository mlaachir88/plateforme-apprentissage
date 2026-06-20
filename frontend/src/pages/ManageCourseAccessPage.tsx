import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Filter,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
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
  profile?: {
    avatarUrl?: string;
    avatarPublicId?: string;
  };
};

type Course = {
  _id: string;
  titre: string;
  matiere: string;
  niveau: string;
  etudiantsAutorises?: Student[];
};

const getInitials = (student: Student) => {
  const first = student.prenom?.trim()?.[0] || "";
  const last = student.nom?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || "E";
};

const StudentAvatar = ({
  student,
  selected = false,
  alreadyAuthorized = false,
  size = "md",
}: {
  student: Student;
  selected?: boolean;
  alreadyAuthorized?: boolean;
  size?: "sm" | "md";
}) => {
  const avatarUrl = student.profile?.avatarUrl || "";
  const sizeClass = size === "sm" ? "h-11 w-11" : "h-12 w-12";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${student.prenom} ${student.nom}`}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-4 ${
          alreadyAuthorized
            ? "ring-emerald-100"
            : selected
            ? "ring-violet-200"
            : "ring-violet-100"
        }`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full text-sm font-black ${
        alreadyAuthorized
          ? "bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100"
          : selected
          ? "bg-violet-600 text-white ring-4 ring-violet-200"
          : "bg-violet-50 text-violet-700 ring-4 ring-violet-100"
      }`}
    >
      {getInitials(student)}
    </div>
  );
};

function ManageCourseAccessPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courseId, setCourseId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [niveauScolaire, setNiveauScolaire] = useState("");
  const [classe, setClasse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [chargementInitial, setChargementInitial] = useState(true);

  const selectedCourse = courses.find((course) => course._id === courseId);

  const authorizedStudentIds = useMemo(() => {
    return (
      selectedCourse?.etudiantsAutorises?.map((student) => student._id) || []
    );
  }, [selectedCourse]);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((student) => {
      const fullName = `${student.prenom} ${student.nom}`.toLowerCase();
      const email = student.email.toLowerCase();
      const classeValue = student.classe.toLowerCase();
      const niveauValue = student.niveauScolaire.toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        classeValue.includes(query) ||
        niveauValue.includes(query)
      );
    });
  }, [students, searchTerm]);

  const alreadyAuthorizedCount = selectedCourse?.etudiantsAutorises?.length || 0;

  const availableStudentsCount = filteredStudents.filter(
    (student) => !authorizedStudentIds.includes(student._id)
  ).length;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);

        if (response.data.length > 0) {
          setCourseId(response.data[0]._id);
        }
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement des cours"
        );
      } finally {
        setChargementInitial(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const params = new URLSearchParams();

        if (niveauScolaire) {
          params.append("niveauScolaire", niveauScolaire);
        }

        if (classe) {
          params.append("classe", classe);
        }

        const response = await api.get(`/students?${params.toString()}`);
        setStudents(response.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement des étudiants"
        );
      }
    };

    fetchStudents();
  }, [niveauScolaire, classe]);

  const refreshCourses = async () => {
    const response = await api.get("/courses");
    setCourses(response.data);
  };

  const toggleStudent = (studentId: string) => {
    if (authorizedStudentIds.includes(studentId)) {
      return;
    }

    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSubmit = async () => {
    setErreur("");
    setMessage("");

    if (!courseId) {
      setErreur("Veuillez sélectionner un cours");
      return;
    }

    if (selectedStudents.length === 0) {
      setErreur("Veuillez sélectionner au moins un nouvel étudiant");
      return;
    }

    setChargement(true);

    try {
      await api.post(`/courses/${courseId}/access`, {
        studentIds: selectedStudents,
      });

      setMessage("Accès au cours accordé avec succès");
      setSelectedStudents([]);

      await refreshCourses();
    } catch (error: any) {
      setErreur(
        error.response?.data?.message ||
          "Erreur lors de l’attribution de l’accès"
      );
    } finally {
      setChargement(false);
    }
  };

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
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
              <ShieldCheck size={16} />
              Gestion des accès
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">
              Accès aux cours
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              Sélectionnez un cours, vérifiez les étudiants déjà autorisés,
              puis ajoutez de nouveaux étudiants à l’espace pédagogique.
            </p>
          </div>
        </section>

        {erreur && (
          <section className="mb-5 rounded-[1.7rem] border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-semibold leading-6">{erreur}</p>
            </div>
          </section>
        )}

        {message && (
          <section className="mb-5 rounded-[1.7rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-700 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-semibold leading-6">{message}</p>
            </div>
          </section>
        )}

        {chargementInitial ? (
          <section className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Clock3 size={23} />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Chargement des accès...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous récupérons vos cours et les étudiants disponibles.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Filter size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      Choisir le cours et filtrer les étudiants
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Les filtres permettent de trouver rapidement la classe à
                      autoriser.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700">
                      Cours
                    </label>

                    <select
                      value={courseId}
                      onChange={(e) => {
                        setCourseId(e.target.value);
                        setSelectedStudents([]);
                        setMessage("");
                        setErreur("");
                      }}
                      className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    >
                      {courses.length === 0 && (
                        <option value="">Aucun cours disponible</option>
                      )}

                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.titre} — {course.matiere}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700">
                      Niveau
                    </label>

                    <select
                      value={niveauScolaire}
                      onChange={(e) => {
                        setNiveauScolaire(e.target.value);
                        setSelectedStudents([]);
                      }}
                      className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="">Tous les niveaux</option>
                      <option value="1ere_college">1ère année collège</option>
                      <option value="2eme_college">2ème année collège</option>
                      <option value="3eme_college">3ème année collège</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700">
                      Classe
                    </label>

                    <select
                      value={classe}
                      onChange={(e) => {
                        setClasse(e.target.value);
                        setSelectedStudents([]);
                      }}
                      className="mt-2 w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="">Toutes les classes</option>
                      <option value="classe_1">Classe 1</option>
                      <option value="classe_2">Classe 2</option>
                      <option value="classe_3">Classe 3</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-bold text-slate-700">
                    Rechercher un étudiant
                  </label>

                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-sm transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
                    <Search size={18} className="shrink-0 text-violet-500" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Nom, email, classe..."
                      className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-100/30 backdrop-blur-xl md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                      <UserPlus size={16} />
                      Ajouter des étudiants
                    </div>

                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                      Étudiants disponibles
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Les étudiants déjà autorisés sont verrouillés pour éviter
                      les doublons.
                    </p>
                  </div>

                  <div className="rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                    {availableStudentsCount} disponible(s)
                  </div>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="mt-6 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-6 text-sm text-slate-500">
                    Aucun étudiant trouvé avec ces filtres.
                  </div>
                ) : (
                  <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-violet-100 bg-white">
                    <div className="max-h-[620px] divide-y divide-slate-100 overflow-y-auto">
                      {filteredStudents.map((student) => {
                        const alreadyAuthorized = authorizedStudentIds.includes(
                          student._id
                        );
                        const selected = selectedStudents.includes(student._id);

                        return (
                          <label
                            key={student._id}
                            className={`flex items-center justify-between gap-4 px-5 py-4 transition ${
                              alreadyAuthorized
                                ? "cursor-not-allowed bg-slate-50 opacity-75"
                                : selected
                                ? "cursor-pointer bg-violet-50/70"
                                : "cursor-pointer bg-white hover:bg-violet-50/40"
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              <StudentAvatar
                                student={student}
                                selected={selected}
                                alreadyAuthorized={alreadyAuthorized}
                              />

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-bold text-slate-950">
                                    {student.prenom} {student.nom}
                                  </p>

                                  {alreadyAuthorized && (
                                    <span className="inline-flex whitespace-nowrap rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                      Déjà autorisé
                                    </span>
                                  )}

                                  {selected && !alreadyAuthorized && (
                                    <span className="inline-flex whitespace-nowrap rounded-full border border-violet-100 bg-white px-3 py-1 text-xs font-bold text-violet-700">
                                      Sélectionné
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 truncate text-sm text-slate-500">
                                  {student.email}
                                </p>

                                <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                  {student.niveauScolaire} · {student.classe}
                                </div>
                              </div>
                            </div>

                            <input
                              type="checkbox"
                              disabled={alreadyAuthorized}
                              checked={alreadyAuthorized || selected}
                              onChange={() => toggleStudent(student._id)}
                              className="h-5 w-5 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={chargement || selectedStudents.length === 0}
                  className="mt-6 group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {chargement
                    ? "Attribution en cours..."
                    : `Donner accès (${selectedStudents.length})`}

                  {!chargement && (
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-0.5"
                    />
                  )}
                </button>
              </section>
            </div>

            <aside className="space-y-6">
              {selectedCourse && (
                <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <BookOpen size={24} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-950">
                        Cours sélectionné
                      </h2>
                      <p className="text-sm text-slate-500">
                        Accès en cours de gestion.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.7rem] border border-violet-100 bg-violet-50/60 p-5">
                    <h3 className="font-bold text-slate-950">
                      {selectedCourse.titre}
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-violet-700">
                      {selectedCourse.matiere} · {selectedCourse.niveau}
                    </p>

                    <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-violet-700">
                      {alreadyAuthorizedCount} étudiant(s) autorisé(s)
                    </div>
                  </div>
                </section>
              )}

              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck size={24} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-950">
                      Déjà autorisés
                    </h2>
                    <p className="text-sm text-slate-500">
                      Étudiants ayant accès.
                    </p>
                  </div>
                </div>

                {!selectedCourse?.etudiantsAutorises ||
                selectedCourse.etudiantsAutorises.length === 0 ? (
                  <div className="mt-5 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                    Aucun étudiant n’a encore accès à ce cours.
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {selectedCourse.etudiantsAutorises
                      .slice(0, 8)
                      .map((student) => (
                        <div
                          key={student._id}
                          className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4"
                        >
                          <StudentAvatar
                            student={student}
                            alreadyAuthorized
                            size="sm"
                          />

                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-950">
                              {student.prenom} {student.nom}
                            </p>
                            <p className="truncate text-sm text-slate-500">
                              {student.email}
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-400">
                              {student.niveauScolaire} · {student.classe}
                            </p>
                          </div>
                        </div>
                      ))}

                    {selectedCourse.etudiantsAutorises.length > 8 && (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-500">
                        +{selectedCourse.etudiantsAutorises.length - 8} autre(s)
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-5 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Sparkles size={24} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-950">
                      Lecture rapide
                    </h2>
                    <p className="text-sm text-slate-500">
                      Accès pédagogique.
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Les étudiants déjà autorisés restent protégés contre les
                  doublons. Sélectionnez uniquement les nouveaux étudiants à
                  ajouter au cours.
                </p>

                <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-violet-700">
                    <GraduationCap size={17} />
                    Sélection actuelle
                  </div>

                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {selectedStudents.length}
                  </p>
                </div>
              </section>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

export default ManageCourseAccessPage;