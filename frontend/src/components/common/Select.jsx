import { useId } from "react";

export default function Select({
     label,
     error,
     hint,
     id,
     className = "",
     children,
     ...props
}) {
     const autoId = useId();
     const selectId = id || autoId;

     return (
          <div className={className}>
               <label
                    htmlFor={selectId}
                    className="mb-1.5 block text-sm font-medium"
               >
                    {label}
               </label>
               <select
                    id={selectId}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                         error
                              ? `${selectId}-error`
                              : hint
                                ? `${selectId}-hint`
                                : undefined
                    }
                    className={`min-h-11 w-full rounded-lg border bg-surface-lowest px-3 text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary ${
                         error ? "border-error" : "border-outline-variant"
                    }`}
                    {...props}
               >
                    {children}
               </select>
               {error ? (
                    <p
                         id={`${selectId}-error`}
                         className="mt-1.5 text-sm text-error"
                    >
                         {error}
                    </p>
               ) : hint ? (
                    <p
                         id={`${selectId}-hint`}
                         className="mt-1.5 text-sm text-on-surface-variant"
                    >
                         {hint}
                    </p>
               ) : null}
          </div>
     );
}
