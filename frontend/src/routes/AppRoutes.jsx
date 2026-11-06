import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/public/HomePage.jsx";
import LoginPage from "../pages/public/LoginPage.jsx";
import SignupPage from "../pages/public/SignupPage.jsx";
import NotFoundPage from "../pages/public/NotFoundPage.jsx";

export default function AppRoutes() {
     return (
          <Routes>
               <Route path="/" element={<HomePage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/signup" element={<SignupPage />} />
               <Route path="*" element={<NotFoundPage />} />
          </Routes>
     );
}
