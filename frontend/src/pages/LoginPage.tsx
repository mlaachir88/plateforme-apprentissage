import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErreur("");
    setChargement(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        motDePasse,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "teacher") {
        navigate("/professeur");
      } else {
        navigate("/etudiant");
      }
    } catch (error: any) {
      setErreur(
        error.response?.data?.message || "Erreur lors de la connexion"
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Plateforme d’apprentissage
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Connexion
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Connectez-vous à votre espace étudiant ou professeur.
          </p>
        </div>

        {erreur && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="exemple@email.com"
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
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Votre mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={chargement}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {chargement ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte étudiant ?{" "}
          <Link
            to="/inscription"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;