import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Star, Trash2 } from "lucide-react";
import StarRating from "../common/StarRating.jsx";
import Button from "../common/Button.jsx";
import Alert from "../common/Alert.jsx";
import {
     createReview,
     deleteReview,
     getMyReview,
     updateReview,
} from "../../api/reviewApi.js";
import {
     getErrorMessage,
     getFieldErrors,
} from "../../utils/getErrorMessage.js";

const MAX_COMMENT = 1000;

// onChanged: called after a review is created, edited or deleted (so the page can refresh its numbers)
export default function ReviewForm({ courseId, onChanged }) {
     const [status, setStatus] = useState("loading"); // loading | ready | error
     const [review, setReview] = useState(null);
     const [editing, setEditing] = useState(false);
     const [rating, setRating] = useState(0);
     const [hover, setHover] = useState(0);
     const [comment, setComment] = useState("");
     const [fieldErrors, setFieldErrors] = useState({});
     const [formError, setFormError] = useState("");
     const [saving, setSaving] = useState(false);
     const [confirmDelete, setConfirmDelete] = useState(false);
     const [reloadKey, setReloadKey] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          setStatus("loading");

          getMyReview(courseId, controller.signal)
               .then((res) => {
                    setReview(res.data.review);
                    setStatus("ready");
               })
               .catch((error) => {
                    if (!axios.isCancel(error)) setStatus("error");
               });

          return () => controller.abort();
     }, [courseId, reloadKey]);

     const startEditing = () => {
          setRating(review.rating);
          setComment(review.comment || "");
          setFormError("");
          setFieldErrors({});
          setEditing(true);
     };

     const cancelEditing = () => {
          setEditing(false);
          setRating(0);
          setComment("");
          setFormError("");
          setFieldErrors({});
     };

     const handleSubmit = async (event) => {
          event.preventDefault();
          setFormError("");

          if (!rating) {
               setFieldErrors({
                    rating: "Please choose a rating from 1 to 5 stars",
               });
               return;
          }
          setFieldErrors({});
          setSaving(true);

          try {
               const payload = { rating, comment: comment.trim() };
               const res = review
                    ? await updateReview(review._id, payload)
                    : await createReview(courseId, payload);

               setReview(res.data.review);
               setEditing(false);
               setRating(0);
               setComment("");
               await onChanged();
          } catch (error) {
               if (error.response?.status === 409)
                    setReloadKey((key) => key + 1); // you already reviewed it
               setFormError(getErrorMessage(error));
               setFieldErrors(getFieldErrors(error));
          } finally {
               setSaving(false);
          }
     };

     const handleDelete = async () => {
          setSaving(true);
          setFormError("");
          try {
               await deleteReview(review._id);
               setReview(null);
               setConfirmDelete(false);
               await onChanged();
          } catch (error) {
               setFormError(getErrorMessage(error));
          } finally {
               setSaving(false);
          }
     };

     if (status === "loading") {
          return (
               <div
                    className="h-28 animate-pulse rounded-xl bg-surface-low"
                    aria-hidden="true"
               />
          );
     }

     if (status === "error") {
          return (
               <div className="space-y-3 rounded-xl border border-outline-variant bg-surface-low p-5">
                    <Alert>Could not load your review. Please try again.</Alert>
                    <Button
                         variant="secondary"
                         onClick={() => setReloadKey((key) => key + 1)}
                    >
                         Try again
                    </Button>
               </div>
          );
     }

     // Your existing review
     if (review && !editing) {
          return (
               <section
                    aria-labelledby="your-review-heading"
                    className="rounded-xl border border-primary/40 bg-primary/5 p-5"
               >
                    <h2
                         id="your-review-heading"
                         className="mb-3 text-lg font-semibold"
                    >
                         Your review
                    </h2>
                    <StarRating value={review.rating} size={18} />
                    {review.comment && (
                         <p className="mt-2 text-on-surface-variant">
                              {review.comment}
                         </p>
                    )}

                    {formError && (
                         <div className="mt-3">
                              <Alert>{formError}</Alert>
                         </div>
                    )}

                    {confirmDelete ? (
                         <div className="mt-4 flex flex-wrap items-center gap-3">
                              <p className="text-sm font-semibold">
                                   Delete your review?
                              </p>
                              <Button onClick={handleDelete} loading={saving}>
                                   Yes, delete
                              </Button>
                              <Button
                                   variant="secondary"
                                   onClick={() => setConfirmDelete(false)}
                                   disabled={saving}
                              >
                                   Cancel
                              </Button>
                         </div>
                    ) : (
                         <div className="mt-4 flex flex-wrap gap-3">
                              <Button
                                   variant="secondary"
                                   onClick={startEditing}
                              >
                                   <Pencil size={16} />
                                   Edit
                              </Button>
                              <Button
                                   variant="secondary"
                                   onClick={() => setConfirmDelete(true)}
                              >
                                   <Trash2 size={16} />
                                   Delete
                              </Button>
                         </div>
                    )}
               </section>
          );
     }

     // Write or edit
     return (
          <section
               aria-labelledby="write-review-heading"
               className="rounded-xl border border-outline-variant bg-surface-low p-5"
          >
               <h2
                    id="write-review-heading"
                    className="mb-1 text-lg font-semibold"
               >
                    {review ? "Edit your review" : "Write a review"}
               </h2>
               <p className="mb-4 text-sm text-on-surface-variant">
                    Share your experience to help other students. You can review
                    a course after completing at least one lesson.
               </p>

               <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <Alert>{formError}</Alert>

                    <div>
                         <p className="mb-1 text-sm font-medium">Your rating</p>
                         <div
                              role="radiogroup"
                              aria-label="Your rating"
                              className="flex gap-1"
                              onMouseLeave={() => setHover(0)}
                         >
                              {[1, 2, 3, 4, 5].map((n) => {
                                   const active = n <= (hover || rating);
                                   return (
                                        <button
                                             key={n}
                                             type="button"
                                             role="radio"
                                             aria-checked={rating === n}
                                             aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                                             onClick={() => setRating(n)}
                                             onMouseEnter={() => setHover(n)}
                                             className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-surface-high"
                                        >
                                             <Star
                                                  size={26}
                                                  className={
                                                       active
                                                            ? "fill-secondary text-secondary"
                                                            : "text-outline"
                                                  }
                                             />
                                        </button>
                                   );
                              })}
                         </div>
                         {fieldErrors.rating && (
                              <p className="mt-1 text-sm text-error">
                                   {fieldErrors.rating}
                              </p>
                         )}
                    </div>

                    <div>
                         <label
                              htmlFor="review-comment"
                              className="mb-1.5 block text-sm font-medium"
                         >
                              Your comment{" "}
                              <span className="font-normal text-on-surface-variant">
                                   (optional)
                              </span>
                         </label>
                         <textarea
                              id="review-comment"
                              rows={4}
                              maxLength={MAX_COMMENT}
                              value={comment}
                              onChange={(event) =>
                                   setComment(event.target.value)
                              }
                              placeholder="What did you like? What could be better?"
                              className="w-full rounded-lg border border-outline-variant bg-surface-lowest px-3.5 py-2.5 text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary"
                         />
                         <div className="mt-1 flex justify-between text-xs text-on-surface-variant">
                              <span className="text-error">
                                   {fieldErrors.comment}
                              </span>
                              <span>
                                   {comment.length} / {MAX_COMMENT}
                              </span>
                         </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                         <Button type="submit" loading={saving}>
                              {review ? "Save changes" : "Submit review"}
                         </Button>
                         {review && (
                              <Button
                                   variant="secondary"
                                   onClick={cancelEditing}
                                   disabled={saving}
                              >
                                   Cancel
                              </Button>
                         )}
                    </div>
               </form>
          </section>
     );
}
