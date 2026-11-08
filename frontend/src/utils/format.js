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

// "2026-11-08" -> "Nov 8"
export const formatDay = (isoDate) =>
     new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
     });

// "5 minutes ago", "3 hours ago", "2 days ago"
export const timeAgo = (value) => {
     const seconds = Math.max(
          0,
          Math.floor((Date.now() - new Date(value).getTime()) / 1000),
     );
     if (seconds < 60) return "just now";
     const minutes = Math.floor(seconds / 60);
     if (minutes < 60)
          return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
     const hours = Math.floor(minutes / 60);
     if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
     const days = Math.floor(hours / 24);
     if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
     return formatDate(value);
};
