// 75 -> "1h 15m", 45 -> "45 min"
export const formatDuration = (minutes = 0) => {
     if (minutes < 60) return `${minutes} min`;
     const hours = Math.floor(minutes / 60);
     const rest = minutes % 60;
     return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

export const formatDate = (value) =>
     new Date(value).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
     });
