// data: [{ label: "Jun", value: 12 }, ...]. The last bar is highlighted.
export default function BarChart({ data, label }) {
     const max = Math.max(...data.map((item) => item.value), 0);
     const summary = data
          .map((item) => `${item.label} ${item.value}`)
          .join(", ");

     return (
          <div role="img" aria-label={`${label}: ${summary}`}>
               <div
                    className="flex h-56 items-end gap-2 sm:gap-4"
                    aria-hidden="true"
               >
                    {data.map((item, index) => {
                         const isLast = index === data.length - 1;
                         // Scaled to 85% so the number above the tallest bar always fits
                         const height = max
                              ? Math.max(
                                     (item.value / max) * 85,
                                     item.value > 0 ? 4 : 0,
                                )
                              : 0;
                         return (
                              <div
                                   key={item.label + index}
                                   className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                              >
                                   <span className="text-xs font-semibold text-on-surface-variant">
                                        {item.value}
                                   </span>
                                   <div
                                        className={`w-full max-w-14 rounded-t-md ${isLast ? "bg-primary" : "bg-primary-container/60"}`}
                                        style={{ height: `${height}%` }}
                                   />
                              </div>
                         );
                    })}
               </div>
               <div
                    className="mt-2 flex gap-2 border-t border-outline-variant pt-2 sm:gap-4"
                    aria-hidden="true"
               >
                    {data.map((item, index) => (
                         <span
                              key={item.label + index}
                              className={`flex-1 text-center text-xs ${
                                   index === data.length - 1
                                        ? "font-semibold text-primary"
                                        : "text-on-surface-variant"
                              }`}
                         >
                              {item.label}
                         </span>
                    ))}
               </div>
          </div>
     );
}
