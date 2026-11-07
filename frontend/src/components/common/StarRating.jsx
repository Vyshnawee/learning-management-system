import { Star } from "lucide-react";

export default function StarRating({ value = 0, size = 16 }) {
     const rounded = Math.round(value);

     return (
          <span
               className="inline-flex gap-0.5"
               role="img"
               aria-label={`Rated ${value} out of 5`}
          >
               {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                         key={n}
                         size={size}
                         className={
                              n <= rounded
                                   ? "fill-secondary text-secondary"
                                   : "text-outline-variant"
                         }
                    />
               ))}
          </span>
     );
}
