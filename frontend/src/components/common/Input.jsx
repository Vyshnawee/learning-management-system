import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
     label,
     error,
     hint,
     type = "text",
     id,
     className = "",
     ...props
}) {
     const autoId = useId();
     const inputId = id || autoId;
     const [showPassword, setShowPassword] = useState(false);
     const isPassword = type === "password";

     return (
          <div className={className}>
               <label
                    htmlFor={inputId}
                    className="mb-1.5 block text-sm font-medium"
               >
                    {label}
               </label>
               <div className="relative">
                    <input
                         id={inputId}
                         type={isPassword && showPassword ? "text" : type}
                         aria-invalid={Boolean(error)}
                         aria-describedby={
                              error
                                   ? `${inputId}-error`
                                   : hint
                                     ? `${inputId}-hint`
                                     : undefined
                         }
                         className={`w-full rounded-lg border bg-surface-lowest px-3.5 py-2.5 text-on-surface outline-none transition placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary ${
                              error ? "border-error" : "border-outline-variant"
                         } ${isPassword ? "pr-11" : ""}`}
                         {...props}
                    />
                    {isPassword && (
                         <button
                              type="button"
                              onClick={() => setShowPassword((value) => !value)}
                              aria-label={
                                   showPassword
                                        ? "Hide password"
                                        : "Show password"
                              }
                              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-outline hover:text-on-surface"
                         >
                              {showPassword ? (
                                   <EyeOff size={18} />
                              ) : (
                                   <Eye size={18} />
                              )}
                         </button>
                    )}
               </div>
               {error ? (
                    <p
                         id={`${inputId}-error`}
                         className="mt-1.5 text-sm text-error"
                    >
                         {error}
                    </p>
               ) : hint ? (
                    <p
                         id={`${inputId}-hint`}
                         className="mt-1.5 text-sm text-on-surface-variant"
                    >
                         {hint}
                    </p>
               ) : null}
          </div>
     );
}
