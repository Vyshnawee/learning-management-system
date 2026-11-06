import { Link } from "react-router-dom";
import Logo from "../../components/common/Logo.jsx";
import Button from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getDashboardPath } from "../../utils/roles.js";

const primaryLink =
     "inline-flex min-h-11 items-center rounded-lg bg-primary px-4 font-semibold text-on-primary hover:bg-primary-container";
const secondaryLink =
     "inline-flex min-h-11 items-center rounded-lg border border-outline-variant px-4 font-semibold hover:bg-surface-high";

export default function HomePage() {
     const { user, loading, logout } = useAuth();

     return (
          <div className="mx-auto max-w-2xl p-6">
               <Logo />
               <div className="mt-10 rounded-xl border border-outline-variant bg-surface-low p-8">
                    {loading ? (
                         <p className="text-on-surface-variant">
                              Checking your session...
                         </p>
                    ) : user ? (
                         <>
                              <h1 className="mb-2 text-3xl font-semibold">
                                   Welcome, {user.name}
                              </h1>
                              <p className="mb-6 text-on-surface-variant">
                                   You are logged in as{" "}
                                   <span className="font-semibold text-primary">
                                        {user.role}
                                   </span>
                                   .
                              </p>
                              <div className="flex flex-wrap gap-3">
                                   <Link
                                        to={getDashboardPath(user.role)}
                                        className={primaryLink}
                                   >
                                        Go to dashboard
                                   </Link>
                                   <Button variant="secondary" onClick={logout}>
                                        Log out
                                   </Button>
                              </div>
                         </>
                    ) : (
                         <>
                              <h1 className="mb-2 text-3xl font-semibold">
                                   You are not logged in
                              </h1>
                              <p className="mb-6 text-on-surface-variant">
                                   Log in or create an account to continue.
                              </p>
                              <div className="flex gap-3">
                                   <Link to="/login" className={primaryLink}>
                                        Log in
                                   </Link>
                                   <Link to="/signup" className={secondaryLink}>
                                        Sign up
                                   </Link>
                              </div>
                         </>
                    )}
               </div>
          </div>
     );
}
