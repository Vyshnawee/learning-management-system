export default function ProgressBar({ value, label = "Course progress" }) {
     const percent = Math.max(0, Math.min(100, value));

     return (
          <div
               role="progressbar"
               aria-label={label}
               aria-valuemin={0}
               aria-valuemax={100}
               aria-valuenow={percent}
               className="h-2 overflow-hidden rounded-full bg-surface-highest"
          >
               <div
                    className={`h-full rounded-full transition-all ${percent === 100 ? "bg-secondary" : "bg-primary"}`}
                    style={{ width: `${percent}%` }}
               />
          </div>
     );
}
