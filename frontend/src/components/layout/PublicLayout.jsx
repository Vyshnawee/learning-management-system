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

export default function PublicLayout() {
     const { user, loading } = useAuth();

     return (
          <div className="flex min-h-screen flex-col">
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

               <main className="flex-1">
                    <Outlet />
               </main>

               <footer className="border-t border-outline-variant py-6 text-center text-sm text-outline">
                    © {new Date().getFullYear()} LearnHub. Free courses for
                    everyone.
               </footer>
          </div>
     );
}
