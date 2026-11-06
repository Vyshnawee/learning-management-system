import { Loader2 } from "lucide-react";

export default function PageLoader({ label = "Loading..." }) {
     return (
          <div
               role="status"
               className="flex min-h-screen flex-col items-center justify-center gap-3 text-on-surface-variant"
          >
               <Loader2 size={32} className="animate-spin text-primary" />
               <span>{label}</span>
          </div>
     );
}
