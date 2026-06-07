import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import StudentDashboardPage from "../pages/StudentDashboardPage";
import TeacherDashboardPage from "../pages/TeacherDashboardPage";
import CreateCoursePage from "../pages/CreateCoursePage";
import CreateQuizPage from "../pages/CreateQuizPage";
import ManageCourseAccessPage from "../pages/ManageCourseAccessPage";
import StudentCourseDetailPage from "../pages/StudentCourseDetailPage";
import StudentQuizPage from "../pages/StudentQuizPage";
import StudentRecommendationsPage from "../pages/StudentRecommendationsPage";
import TeacherResultsPage from "../pages/TeacherResultsPage";
import StudentResultsPage from "../pages/StudentResultsPage";
import TeacherCoursesPage from "../pages/TeacherCoursesPage";
import TeacherQuizzesPage from "../pages/TeacherQuizzesPage";
import TeacherCourseDetailPage from "../pages/TeacherCourseDetailPage";
import TeacherQuizDetailPage from "../pages/TeacherQuizDetailPage";
import LandingPage from "../pages/LandingPage";
import NotFoundRedirect from "./NotFoundRedirect";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/etudiant" element={<StudentDashboardPage />} />
        <Route path="/professeur" element={<TeacherDashboardPage />} />
        <Route path="/professeur/cours/nouveau" element={<CreateCoursePage />} />
        <Route path="/professeur/quiz/nouveau" element={<CreateQuizPage />} />
        <Route
          path="/professeur/cours/acces"
          element={<ManageCourseAccessPage />}
        />
        <Route path="/etudiant/cours/:courseId" element={<StudentCourseDetailPage />} />
        <Route path="/etudiant/quiz/:quizId" element={<StudentQuizPage />} />
        <Route
          path="/etudiant/recommandations"
          element={<StudentRecommendationsPage />}
        />
        <Route path="/professeur/resultats" element={<TeacherResultsPage />} />
        <Route path="/etudiant/resultats" element={<StudentResultsPage />} />
        <Route path="/professeur/cours" element={<TeacherCoursesPage />} />
        <Route path="/professeur/quiz" element={<TeacherQuizzesPage />} />
        <Route path="/professeur/cours/:courseId" element={<TeacherCourseDetailPage />} />
        <Route path="/professeur/quiz/:quizId" element={<TeacherQuizDetailPage />} />
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;