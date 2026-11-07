import { useId } from "react";
import { Plus, X } from "lucide-react";

export default function ListEditor({
     label,
     hint,
     items,
     onChange,
     error,
     placeholder,
     addLabel = "Add another",
     max = 20,
     maxLength = 200,
}) {
     const groupId = useId();

     const update = (index, value) =>
          onChange(items.map((item, i) => (i === index ? value : item)));
     const remove = (index) => onChange(items.filter((_, i) => i !== index));
     const add = () => onChange([...items, ""]);

     return (
          <fieldset
               aria-describedby={
                    error
                         ? `${groupId}-error`
                         : hint
                           ? `${groupId}-hint`
                           : undefined
               }
          >
               <legend className="mb-1.5 text-sm font-medium">{label}</legend>
               {hint && (
                    <p
                         id={`${groupId}-hint`}
                         className="mb-3 text-sm text-on-surface-variant"
                    >
                         {hint}
                    </p>
               )}

               <ul className="space-y-2">
                    {items.map((item, index) => (
                         <li key={index} className="flex gap-2">
                              <input
                                   type="text"
                                   value={item}
                                   maxLength={maxLength}
                                   onChange={(event) =>
                                        update(index, event.target.value)
                                   }
                                   placeholder={placeholder}
                                   aria-label={`${label}, item ${index + 1}`}
                                   className="min-h-11 min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-lowest px-3.5 text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary"
                              />
                              <button
                                   type="button"
                                   onClick={() => remove(index)}
                                   aria-label={`Remove item ${index + 1}`}
                                   className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition hover:bg-error-container/30 hover:text-error"
                              >
                                   <X size={18} />
                              </button>
                         </li>
                    ))}
               </ul>

               <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                         type="button"
                         onClick={add}
                         disabled={items.length >= max}
                         className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary transition hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-50"
                    >
                         <Plus size={16} />
                         {addLabel}
                    </button>
                    <span className="text-xs text-on-surface-variant">
                         {items.length} / {max}
                    </span>
               </div>

               {error && (
                    <p
                         id={`${groupId}-error`}
                         className="mt-1.5 text-sm text-error"
                    >
                         {error}
                    </p>
               )}
          </fieldset>
     );
}
