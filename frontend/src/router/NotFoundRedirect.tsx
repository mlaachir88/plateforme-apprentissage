import { Navigate } from "react-router-dom";

function NotFoundRedirect() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.role === "teacher") {
    return <Navigate to="/professeur" replace />;
  }

  if (user.role === "student") {
    return <Navigate to="/etudiant" replace />;
  }

  return <Navigate to="/" replace />;
}

export default NotFoundRedirect;