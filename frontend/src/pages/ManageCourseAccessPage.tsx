import { useEffect, useState } from "react";
import api from "../api/axios";
import TeacherNav from "../components/TeacherNav";

type Course = {
  _id: string;
  titre: string;
  matiere: string;
  niveau: string;
  etudiantsAutorises?: Student[];
};

type Student = {
  _id: string;
  prenom: string;
  nom: string;
  email: string;
  niveauScolaire: string;
  classe: string;
};

function ManageCourseAccessPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courseId, setCourseId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [niveauScolaire, setNiveauScolaire] = useState("");
  const [classe, setClasse] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const selectedCourse = courses.find((course) => course._id === courseId);

  const authorizedStudentIds =
    selectedCourse?.etudiantsAutorises?.map((student) => student._id) || [];

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
    <div className="min-h-screen bg-slate-50">
      <TeacherNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Gestion des accès aux cours
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sélectionnez un cours, vérifiez les étudiants déjà autorisés, puis ajoutez de nouveaux étudiants.
            </p>
          </div>

          {erreur && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erreur}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
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
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.titre} — {course.matiere}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Niveau
              </label>

              <select
                value={niveauScolaire}
                onChange={(e) => setNiveauScolaire(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Tous les niveaux</option>
                <option value="1ere_college">1ère année collège</option>
                <option value="2eme_college">2ème année collège</option>
                <option value="3eme_college">3ème année collège</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Classe
              </label>

              <select
                value={classe}
                onChange={(e) => setClasse(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Toutes les classes</option>
                <option value="classe_1">Classe 1</option>
                <option value="classe_2">Classe 2</option>
                <option value="classe_3">Classe 3</option>
              </select>
            </div>
          </div>

          {selectedCourse && (
            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Cours sélectionné
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    {selectedCourse.titre}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {selectedCourse.matiere} · {selectedCourse.niveau}
                  </p>
                </div>

                <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700">
                  {selectedCourse.etudiantsAutorises?.length || 0} étudiant(s) autorisé(s)
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-700">
                  Étudiants déjà autorisés
                </p>

                {!selectedCourse.etudiantsAutorises ||
                selectedCourse.etudiantsAutorises.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Aucun étudiant n’a encore accès à ce cours.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedCourse.etudiantsAutorises.map((student) => (
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
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">
              Ajouter des étudiants
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Les étudiants déjà autorisés sont indiqués et ne peuvent pas être sélectionnés à nouveau.
            </p>

            {students.length === 0 ? (
              <div className="mt-5 rounded-xl bg-slate-50 p-6 text-sm text-slate-500">
                Aucun étudiant trouvé.
              </div>
            ) : (
              <div className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200">
                {students.map((student) => {
                  const alreadyAuthorized = authorizedStudentIds.includes(
                    student._id
                  );

                  return (
                    <label
                      key={student._id}
                      className={`flex items-center justify-between px-5 py-4 ${
                        alreadyAuthorized
                          ? "cursor-not-allowed bg-slate-50 opacity-70"
                          : "cursor-pointer bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">
                            {student.prenom} {student.nom}
                          </p>

                          {alreadyAuthorized && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              Déjà autorisé
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-500">
                          {student.email} · {student.niveauScolaire} ·{" "}
                          {student.classe}
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        disabled={alreadyAuthorized}
                        checked={
                          alreadyAuthorized ||
                          selectedStudents.includes(student._id)
                        }
                        onChange={() => toggleStudent(student._id)}
                        className="h-5 w-5 rounded border-slate-300"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={chargement || selectedStudents.length === 0}
            className="mt-8 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {chargement
              ? "Attribution en cours..."
              : `Donner accès (${selectedStudents.length})`}
          </button>
        </div>
      </main>
    </div>
  );
}

export default ManageCourseAccessPage;