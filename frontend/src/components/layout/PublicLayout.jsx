import { Link, NavLink, Outlet } from "react-router-dom";
import Logo from "../common/Logo.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getDashboardPath } from "../../utils/roles.js";

const navLinkClass = ({ isActive }) =>
     `rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
               ? "text-primary"
               : "text-on-surface-variant hover:text-on-surface"
     }`;

const footerLink =
     "inline-flex min-h-11 items-center text-sm text-on-surface-variant hover:text-on-surface";

export default function PublicLayout() {
     const { user, loading } = useAuth();

     return (
          <div className="flex min-h-screen flex-col">
               <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:font-semibold focus:text-on-primary"
               >
                    Skip to content
               </a>

               <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/90 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
                         <div className="flex items-center gap-2 sm:gap-6">
                              <Logo />
                              <nav aria-label="Main">
                                   <NavLink
                                        to="/courses"
                                        className={navLinkClass}
                                   >
                                        Courses
                                   </NavLink>
                              </nav>
                         </div>

                         <div className="flex items-center gap-2">
                              {loading ? null : user ? (
                                   <Link
                                        to={getDashboardPath(user.role)}
                                        className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-container"
                                   >
                                        My dashboard
                                   </Link>
                              ) : (
                                   <>
                                        <Link
                                             to="/login"
                                             className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-on-surface hover:bg-surface-high"
                                        >
                                             Log in
                                        </Link>
                                        <Link
                                             to="/signup"
                                             className="inline-flex min-h-11 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary hover:bg-primary-container sm:px-4"
                                        >
                                             Sign up
                                        </Link>
                                   </>
                              )}
                         </div>
                    </div>
               </header>

               <main id="main-content" className="flex-1">
                    <Outlet />
               </main>

               <footer className="border-t border-outline-variant bg-surface-low">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
                         <div>
                              <Logo />
                              <p className="mt-3 max-w-xs text-sm text-on-surface-variant">
                                   Free online courses with video lessons,
                                   quizzes and certificates, taught by
                                   instructors who love what they do.
                              </p>
                         </div>

                         <nav aria-label="Learn">
                              <p className="mb-2 text-sm font-semibold">
                                   Learn
                              </p>
                              <ul>
                                   <li>
                                        <Link
                                             to="/courses"
                                             className={footerLink}
                                        >
                                             Browse courses
                                        </Link>
                                   </li>
                                   <li>
                                        <Link
                                             to={
                                                  user
                                                       ? getDashboardPath(
                                                              user.role,
                                                         )
                                                       : "/signup"
                                             }
                                             className={footerLink}
                                        >
                                             {user
                                                  ? "My dashboard"
                                                  : "Create a free account"}
                                        </Link>
                                   </li>
                              </ul>
                         </nav>

                         <nav aria-label="Teach">
                              <p className="mb-2 text-sm font-semibold">
                                   Teach
                              </p>
                              <ul>
                                   <li>
                                        <Link
                                             to={
                                                  user
                                                       ? getDashboardPath(
                                                              user.role,
                                                         )
                                                       : "/signup?role=instructor"
                                             }
                                             className={footerLink}
                                        >
                                             {user
                                                  ? "Open my dashboard"
                                                  : "Become an instructor"}
                                        </Link>
                                   </li>
                                   {!user && (
                                        <li>
                                             <Link
                                                  to="/login"
                                                  className={footerLink}
                                             >
                                                  Log in
                                             </Link>
                                        </li>
                                   )}
                              </ul>
                         </nav>
                    </div>
                    <p className="border-t border-outline-variant py-5 text-center text-sm text-outline">
                         © {new Date().getFullYear()} LearnHub. Free courses for
                         everyone.
                    </p>
               </footer>
          </div>
     );
}
