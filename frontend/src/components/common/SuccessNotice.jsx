import { CheckCircle2 } from "lucide-react";

export default function SuccessNotice({ children }) {
     if (!children) return null;

     return (
          <div
               role="status"
               className="flex items-start gap-2.5 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-3 text-sm text-primary"
          >
               <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
               <span>{children}</span>
          </div>
     );
}
