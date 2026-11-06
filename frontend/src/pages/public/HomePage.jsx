import { Link } from "react-router-dom";
import Logo from "../../components/common/Logo.jsx";
import Button from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";

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
                                   </span>{" "}
                                   ({user.email}).
                              </p>
                              <Button variant="secondary" onClick={logout}>
                                   Log out
                              </Button>
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
                                   <Link
                                        to="/login"
                                        className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 font-semibold text-on-primary hover:bg-primary-container"
                                   >
                                        Log in
                                   </Link>
                                   <Link
                                        to="/signup"
                                        className="inline-flex min-h-11 items-center rounded-lg border border-outline-variant px-4 font-semibold hover:bg-surface-high"
                                   >
                                        Sign up
                                   </Link>
                              </div>
                         </>
                    )}
               </div>
          </div>
     );
}
