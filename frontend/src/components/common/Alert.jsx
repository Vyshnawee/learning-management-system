import { AlertCircle } from "lucide-react";

export default function Alert({ children }) {
     if (!children) return null;

     return (
          <div
               role="alert"
               className="flex items-start gap-2.5 rounded-lg border border-error/40 bg-error-container/30 px-3.5 py-3 text-sm text-on-error-container"
          >
               <AlertCircle size={18} className="mt-0.5 shrink-0" />
               <span>{children}</span>
          </div>
     );
}
