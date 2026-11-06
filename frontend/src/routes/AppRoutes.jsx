import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import PublicLayout from "../components/layout/PublicLayout.jsx";
import HomePage from "../pages/public/HomePage.jsx";
import CatalogPage from "../pages/public/CatalogPage.jsx";
import LoginPage from "../pages/public/LoginPage.jsx";
import SignupPage from "../pages/public/SignupPage.jsx";
import ForbiddenPage from "../pages/public/ForbiddenPage.jsx";
import NotFoundPage from "../pages/public/NotFoundPage.jsx";
import ComingSoonPage from "../pages/shared/ComingSoonPage.jsx";

export default function AppRoutes() {
     return (
          <Routes>
               {/* Public pages with the top navbar */}
               <Route element={<PublicLayout />}>
                    <Route path="/courses" element={<CatalogPage />} />
                    <Route
                         path="/courses/:courseId"
                         element={<ComingSoonPage title="Course details" />}
                    />
               </Route>

               {/* Public pages without a layout */}
               <Route path="/" element={<HomePage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/signup" element={<SignupPage />} />
               <Route path="/403" element={<ForbiddenPage />} />

               {/* Student */}
               <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                    <Route element={<DashboardLayout />}>
                         <Route
                              path="/student"
                              element={
                                   <Navigate to="/student/dashboard" replace />
                              }
                         />
                         <Route
                              path="/student/dashboard"
                              element={
                                   <ComingSoonPage title="Student dashboard" />
                              }
                         />
                         <Route
                              path="/student/courses"
                              element={<ComingSoonPage title="My courses" />}
                         />
                         <Route
                              path="/student/certificates"
                              element={
                                   <ComingSoonPage title="My certificates" />
                              }
                         />
                         <Route
                              path="/student/profile"
                              element={<ComingSoonPage title="Profile" />}
                         />
                    </Route>
               </Route>

               {/* Instructor */}
               <Route
                    element={<ProtectedRoute allowedRoles={["instructor"]} />}
               >
                    <Route element={<DashboardLayout />}>
                         <Route
                              path="/instructor"
                              element={
                                   <Navigate
                                        to="/instructor/dashboard"
                                        replace
                                   />
                              }
                         />
                         <Route
                              path="/instructor/dashboard"
                              element={
                                   <ComingSoonPage title="Instructor dashboard" />
                              }
                         />
                         <Route
                              path="/instructor/courses"
                              element={<ComingSoonPage title="My courses" />}
                         />
                         <Route
                              path="/instructor/courses/new"
                              element={<ComingSoonPage title="Create course" />}
                         />
                         <Route
                              path="/instructor/students"
                              element={<ComingSoonPage title="Students" />}
                         />
                         <Route
                              path="/instructor/quizzes"
                              element={<ComingSoonPage title="Quizzes" />}
                         />
                         <Route
                              path="/instructor/analytics"
                              element={<ComingSoonPage title="Analytics" />}
                         />
                         <Route
                              path="/instructor/profile"
                              element={<ComingSoonPage title="Profile" />}
                         />
                    </Route>
               </Route>

               {/* Admin */}
               <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route element={<DashboardLayout />}>
                         <Route
                              path="/admin"
                              element={
                                   <Navigate to="/admin/dashboard" replace />
                              }
                         />
                         <Route
                              path="/admin/dashboard"
                              element={
                                   <ComingSoonPage title="Admin dashboard" />
                              }
                         />
                         <Route
                              path="/admin/users"
                              element={<ComingSoonPage title="Users" />}
                         />
                         <Route
                              path="/admin/courses"
                              element={<ComingSoonPage title="Courses" />}
                         />
                         <Route
                              path="/admin/categories"
                              element={<ComingSoonPage title="Categories" />}
                         />
                         <Route
                              path="/admin/enrollments"
                              element={
                                   <ComingSoonPage title="Enrollment statistics" />
                              }
                         />
                    </Route>
               </Route>

               <Route path="*" element={<NotFoundPage />} />
          </Routes>
     );
}
