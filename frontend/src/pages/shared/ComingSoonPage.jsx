import { Hammer } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

export default function ComingSoonPage({ title }) {
     const { user } = useAuth();

     return (
          <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-outline-variant bg-surface-low p-10 text-center">
               <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-highest text-primary">
                    <Hammer size={22} />
               </span>
               <h1 className="mb-2 text-3xl font-semibold">{title}</h1>
               <p className="text-on-surface-variant">
                    This page will be built in a later step.
               </p>
               {user && (
                    <p className="mt-4 text-sm text-outline">
                         Signed in as {user.name} ({user.role})
                    </p>
               )}
          </div>
     );
}
