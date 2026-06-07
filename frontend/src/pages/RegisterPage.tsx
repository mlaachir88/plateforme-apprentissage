import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function RegisterPage() {
  const navigate = useNavigate();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [niveauScolaire, setNiveauScolaire] = useState("1ere_college");
  const [classe, setClasse] = useState("classe_1");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErreur("");
    setChargement(true);

    try {
      const response = await api.post("/auth/register", {
        prenom,
        nom,
        email,
        motDePasse,
        niveauScolaire,
        classe,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/etudiant");
    } catch (error: any) {
      setErreur(
        error.response?.data?.message || "Erreur lors de la création du compte"
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Plateforme d’apprentissage
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Créer un compte étudiant
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Inscrivez-vous pour accéder aux cours attribués par votre professeur.
          </p>
        </div>

        {erreur && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Prénom
              </label>
              <input
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Mohamed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Nom
              </label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Laachir"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="etudiant@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              minLength={6}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Niveau scolaire
              </label>
              <select
                value={niveauScolaire}
                onChange={(e) => setNiveauScolaire(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
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
                <option value="classe_1">Classe 1</option>
                <option value="classe_2">Classe 2</option>
                <option value="classe_3">Classe 3</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={chargement}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {chargement ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà un compte ?{" "}
          <Link
            to="/connexion"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;