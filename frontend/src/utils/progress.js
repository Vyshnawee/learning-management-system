// Progress shown on screen, worked out from the lesson counts the server sends
export const getProgress = (enrollment) => {
     const total = enrollment.lessonCount || 0;
     const done = Math.min(enrollment.completedCount || 0, total);
     const percent = total ? Math.floor((done / total) * 100) : 0;
     return { total, done, percent, isComplete: total > 0 && done === total };
};
