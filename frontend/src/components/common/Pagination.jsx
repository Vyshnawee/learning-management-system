import { ChevronLeft, ChevronRight } from "lucide-react";

// 1 ... 4 5 6 ... 12
const getPageNumbers = (current, total) => {
     if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

     const pages = new Set([1, total, current - 1, current, current + 1]);
     const sorted = [...pages]
          .filter((p) => p >= 1 && p <= total)
          .sort((a, b) => a - b);

     const result = [];
     sorted.forEach((p, i) => {
          if (i > 0 && p - sorted[i - 1] > 1) result.push("gap-" + p);
          result.push(p);
     });
     return result;
};

const buttonBase =
     "flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-medium transition";

export default function Pagination({ pagination, noun = "courses", onChange }) {
     const { total, page, limit, totalPages } = pagination;
     if (!total) return null;

     const first = (page - 1) * limit + 1;
     const last = Math.min(page * limit, total);

     return (
          <nav
               aria-label="Pagination"
               className="flex flex-col items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-low px-4 py-3 sm:flex-row"
          >
               <p className="text-sm text-on-surface-variant">
                    Showing{" "}
                    <span className="font-semibold text-on-surface">
                         {first}–{last}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-on-surface">
                         {total}
                    </span>{" "}
                    {noun}
               </p>

               {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                         <button
                              onClick={() => onChange(page - 1)}
                              disabled={page <= 1}
                              aria-label="Previous page"
                              className={`${buttonBase} border-outline-variant hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-40`}
                         >
                              <ChevronLeft size={18} />
                         </button>

                         {getPageNumbers(page, totalPages).map((item) =>
                              typeof item === "string" ? (
                                   <span
                                        key={item}
                                        className="px-1 text-outline"
                                   >
                                        …
                                   </span>
                              ) : (
                                   <button
                                        key={item}
                                        onClick={() => onChange(item)}
                                        aria-current={
                                             item === page ? "page" : undefined
                                        }
                                        className={`${buttonBase} ${
                                             item === page
                                                  ? "border-primary bg-primary text-on-primary"
                                                  : "border-outline-variant hover:bg-surface-high"
                                        }`}
                                   >
                                        {item}
                                   </button>
                              ),
                         )}

                         <button
                              onClick={() => onChange(page + 1)}
                              disabled={page >= totalPages}
                              aria-label="Next page"
                              className={`${buttonBase} border-outline-variant hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-40`}
                         >
                              <ChevronRight size={18} />
                         </button>
                    </div>
               )}
          </nav>
     );
}
