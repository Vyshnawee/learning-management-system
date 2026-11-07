import { useId } from "react";

export default function Textarea({
     label,
     error,
     hint,
     maxLength,
     value,
     id,
     className = "",
     ...props
}) {
     const autoId = useId();
     const textareaId = id || autoId;

     return (
          <div className={className}>
               <label
                    htmlFor={textareaId}
                    className="mb-1.5 block text-sm font-medium"
               >
                    {label}
               </label>
               <textarea
                    id={textareaId}
                    value={value}
                    maxLength={maxLength}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                         error
                              ? `${textareaId}-error`
                              : hint
                                ? `${textareaId}-hint`
                                : undefined
                    }
                    className={`w-full rounded-lg border bg-surface-lowest px-3.5 py-2.5 text-on-surface outline-none transition placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary ${
                         error ? "border-error" : "border-outline-variant"
                    }`}
                    {...props}
               />
               <div className="mt-1.5 flex justify-between gap-3 text-sm">
                    <span
                         id={
                              error
                                   ? `${textareaId}-error`
                                   : `${textareaId}-hint`
                         }
                         className={
                              error ? "text-error" : "text-on-surface-variant"
                         }
                    >
                         {error || hint}
                    </span>
                    {maxLength && (
                         <span className="shrink-0 text-xs text-on-surface-variant">
                              {value.length} / {maxLength}
                         </span>
                    )}
               </div>
          </div>
     );
}
