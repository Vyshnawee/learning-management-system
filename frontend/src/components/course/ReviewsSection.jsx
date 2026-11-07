import { useEffect, useState } from "react";
import axios from "axios";
import { MessageSquare } from "lucide-react";
import StarRating from "../common/StarRating.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Button from "../common/Button.jsx";
import Alert from "../common/Alert.jsx";
import { getCourseReviews } from "../../api/reviewApi.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { formatDate } from "../../utils/format.js";

const PAGE_SIZE = 5;

export default function ReviewsSection({
     courseId,
     ratingAverage,
     ratingCount,
     breakdown,
}) {
     const [reviews, setReviews] = useState([]);
     const [page, setPage] = useState(1);
     const [totalPages, setTotalPages] = useState(1);
     const [status, setStatus] = useState("loading"); // loading | success | error
     const [errorMessage, setErrorMessage] = useState("");
     const [retryKey, setRetryKey] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          setStatus("loading");

          getCourseReviews(
               courseId,
               { page, limit: PAGE_SIZE },
               controller.signal,
          )
               .then((res) => {
                    // Page 1 replaces the list. Later pages are added to the end.
                    setReviews((current) =>
                         page === 1
                              ? res.data.reviews
                              : [...current, ...res.data.reviews],
                    );
                    setTotalPages(res.pagination.totalPages);
                    setStatus("success");
               })
               .catch((error) => {
                    if (axios.isCancel(error)) return;
                    setErrorMessage(getErrorMessage(error));
                    setStatus("error");
               });

          return () => controller.abort();
     }, [courseId, page, retryKey]);

     return (
          <section aria-labelledby="reviews-heading">
               <h2 id="reviews-heading" className="mb-4 text-2xl font-semibold">
                    Student reviews
               </h2>

               {ratingCount > 0 && (
                    <div className="mb-6 grid gap-6 rounded-xl border border-outline-variant bg-surface-low p-6 sm:grid-cols-[auto_1fr]">
                         <div className="flex flex-col items-center justify-center sm:px-6">
                              <p className="font-heading text-5xl font-bold">
                                   {ratingAverage.toFixed(1)}
                              </p>
                              <StarRating value={ratingAverage} size={18} />
                              <p className="mt-1 text-sm text-on-surface-variant">
                                   {ratingCount}{" "}
                                   {ratingCount === 1 ? "rating" : "ratings"}
                              </p>
                         </div>
                         <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map((star) => {
                                   const count = breakdown[star] || 0;
                                   const percent = Math.round(
                                        (count / ratingCount) * 100,
                                   );
                                   return (
                                        <div
                                             key={star}
                                             className="flex items-center gap-3 text-sm"
                                        >
                                             <span className="w-12 shrink-0 text-on-surface-variant">
                                                  {star} star
                                             </span>
                                             <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-highest">
                                                  <div
                                                       className="h-full rounded-full bg-primary"
                                                       style={{
                                                            width: `${percent}%`,
                                                       }}
                                                  />
                                             </div>
                                             <span className="w-10 shrink-0 text-right text-on-surface-variant">
                                                  {percent}%
                                             </span>
                                        </div>
                                   );
                              })}
                         </div>
                    </div>
               )}

               {status === "error" && (
                    <div className="space-y-3">
                         <Alert>{errorMessage}</Alert>
                         <Button
                              variant="secondary"
                              onClick={() => setRetryKey((k) => k + 1)}
                         >
                              Try again
                         </Button>
                    </div>
               )}

               {status !== "error" &&
                    reviews.length === 0 &&
                    status === "loading" && (
                         <div
                              className="h-24 animate-pulse rounded-xl bg-surface-low"
                              aria-hidden="true"
                         />
                    )}

               {status === "success" && reviews.length === 0 && (
                    <EmptyState
                         icon={MessageSquare}
                         title="No reviews yet"
                         text="Be the first to share your experience after taking this course."
                    />
               )}

               {reviews.length > 0 && (
                    <ul className="space-y-4">
                         {reviews.map((review) => (
                              <li
                                   key={review._id}
                                   className="rounded-xl border border-outline-variant bg-surface-low p-5"
                              >
                                   <div className="mb-2 flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                             <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-highest text-sm font-bold">
                                                  {(
                                                       review.studentId?.name ||
                                                       "?"
                                                  )
                                                       .charAt(0)
                                                       .toUpperCase()}
                                             </span>
                                             <span className="truncate font-semibold">
                                                  {review.studentId?.name ||
                                                       "Student"}
                                             </span>
                                        </div>
                                        <StarRating
                                             value={review.rating}
                                             size={15}
                                        />
                                   </div>
                                   {review.comment && (
                                        <p className="text-on-surface-variant">
                                             {review.comment}
                                        </p>
                                   )}
                                   <p className="mt-2 text-xs text-outline">
                                        {formatDate(review.createdAt)}
                                   </p>
                              </li>
                         ))}
                    </ul>
               )}

               {status === "success" && page < totalPages && (
                    <div className="mt-4 text-center">
                         <Button
                              variant="secondary"
                              onClick={() => setPage((p) => p + 1)}
                         >
                              Load more reviews
                         </Button>
                    </div>
               )}
               {status === "loading" && reviews.length > 0 && (
                    <p className="mt-4 text-center text-sm text-on-surface-variant">
                         Loading...
                    </p>
               )}
          </section>
     );
}
