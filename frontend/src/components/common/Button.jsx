import { Loader2 } from "lucide-react";

const variants = {
     primary: "bg-primary text-on-primary hover:bg-primary-container",
     secondary:
          "border border-outline-variant text-on-surface hover:bg-surface-high",
};

export default function Button({
     variant = "primary",
     loading = false,
     disabled = false,
     className = "",
     children,
     ...props
}) {
     return (
          <button
               disabled={disabled || loading}
               className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
               {...props}
          >
               {loading && <Loader2 size={18} className="animate-spin" />}
               {children}
          </button>
     );
}
