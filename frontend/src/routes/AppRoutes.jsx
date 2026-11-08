import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import PublicLayout from "../components/layout/PublicLayout.jsx";

import HomePage from "../pages/public/HomePage.jsx";
import CatalogPage from "../pages/public/CatalogPage.jsx";
import LoginPage from "../pages/public/LoginPage.jsx";
import SignupPage from "../pages/public/SignupPage.jsx";
import CourseDetailsPage from "../pages/public/CourseDetailsPage.jsx";
import ForbiddenPage from "../pages/public/ForbiddenPage.jsx";
import NotFoundPage from "../pages/public/NotFoundPage.jsx";

import ComingSoonPage from "../pages/shared/ComingSoonPage.jsx";

import StudentDashboardPage from "../pages/student/StudentDashboardPage.jsx";
import MyCoursesPage from "../pages/student/MyCoursesPage.jsx";
import LearningPage from "../pages/student/LearningPage.jsx";
import QuizPage from "../pages/student/QuizPage.jsx";
import MyCertificatesPage from "../pages/student/MyCertificatesPage.jsx";
import CertificatePage from "../pages/public/CertificatePage.jsx";

import InstructorDashboardPage from "../pages/instructor/InstructorDashboardPage.jsx";
import InstructorCoursesPage from "../pages/instructor/InstructorCoursesPage.jsx";
import CreateCoursePage from "../pages/instructor/CreateCoursePage.jsx";
import EditCoursePage from "../pages/instructor/EditCoursePage.jsx";
import CurriculumPage from "../pages/instructor/CurriculumPage.jsx";
import InstructorStudentsPage from "../pages/instructor/InstructorStudentsPage.jsx";
import InstructorQuizzesPage from "../pages/instructor/InstructorQuizzesPage.jsx";
import InstructorAnalyticsPage from "../pages/instructor/InstructorAnalyticsPage.jsx";
import QuizBuilderPage from "../pages/instructor/QuizBuilderPage.jsx";
import ProfilePage from "../pages/shared/ProfilePage.jsx";

export default function AppRoutes() {
     return (
          <Routes>
               {/* Public pages with navbar */}
               <Route element={<PublicLayout />}>
                    <Route path="/courses" element={<CatalogPage />} />
                    <Route
                         path="/courses/:courseId"
                         element={<CourseDetailsPage />}
                    />
               </Route>

               {/* Public pages */}
               <Route path="/" element={<HomePage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/signup" element={<SignupPage />} />
               <Route path="/403" element={<ForbiddenPage />} />
               <Route
                    path="/certificates/:certificateId"
                    element={<CertificatePage />}
               />

               {/* Student protected routes */}
               <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                    {/* Student dashboard with sidebar */}
                    <Route element={<DashboardLayout />}>
                         <Route
                              path="/student"
                              element={
                                   <Navigate to="/student/dashboard" replace />
                              }
                         />

                         <Route
                              path="/student/dashboard"
                              element={<StudentDashboardPage />}
                         />

                         <Route
                              path="/student/courses"
                              element={<MyCoursesPage />}
                         />

                         <Route
                              path="/student/certificates"
                              element={<MyCertificatesPage />}
                         />
                         <Route
                              path="/student/profile"
                              element={<ProfilePage />}
                         />
                    </Route>

                    <Route
                         path="/student/learn/:courseId/:lessonId?"
                         element={<LearningPage />}
                    />
                    <Route
                         path="/student/quizzes/:quizId"
                         element={<QuizPage />}
                    />
               </Route>

               {/* Instructor protected routes */}
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
                              element={<InstructorDashboardPage />}
                         />
                         <Route
                              path="/instructor/courses"
                              element={<InstructorCoursesPage />}
                         />

                         <Route
                              path="/instructor/courses/new"
                              element={<CreateCoursePage />}
                         />
                         <Route
                              path="/instructor/courses/:courseId/edit"
                              element={<EditCoursePage />}
                         />
                         <Route
                              path="/instructor/courses/:courseId/curriculum"
                              element={<CurriculumPage />}
                         />
                         <Route
                              path="/instructor/students"
                              element={<InstructorStudentsPage />}
                         />
                         <Route
                              path="/instructor/quizzes"
                              element={<InstructorQuizzesPage />}
                         />
                         <Route
                              path="/instructor/quizzes/new"
                              element={<QuizBuilderPage />}
                         />
                         <Route
                              path="/instructor/quizzes/:quizId/edit"
                              element={<QuizBuilderPage />}
                         />
                         <Route
                              path="/instructor/analytics"
                              element={<InstructorAnalyticsPage />}
                         />
                         <Route
                              path="/instructor/profile"
                              element={<ProfilePage />}
                         />
                    </Route>
               </Route>

               {/* Admin protected routes */}
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

               {/* 404 */}
               <Route path="*" element={<NotFoundPage />} />
          </Routes>
     );
}
