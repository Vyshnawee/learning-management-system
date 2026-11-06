import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { getDashboardPath } from "../../utils/roles.js";

export default function ForbiddenPage() {
     const { user } = useAuth();

     return (
          <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
               <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-outline-variant bg-surface-low text-secondary">
                    <Lock size={26} />
               </span>
               <p className="font-heading text-8xl font-bold text-primary">
                    403
               </p>
               <h1 className="mt-4 text-3xl font-semibold">Access denied</h1>
               <p className="mt-2 max-w-md text-on-surface-variant">
                    You don&apos;t have permission to open this page.
               </p>
               <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                         to={user ? getDashboardPath(user.role) : "/login"}
                         className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-on-primary hover:bg-primary-container"
                    >
                         {user ? "Go to my dashboard" : "Log in"}
                    </Link>
                    <Link
                         to="/courses"
                         className="inline-flex min-h-11 items-center rounded-lg border border-outline-variant px-5 font-semibold hover:bg-surface-high"
                    >
                         Browse courses
                    </Link>
               </div>
          </div>
     );
}
