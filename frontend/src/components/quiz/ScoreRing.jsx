export default function ScoreRing({ percent, passed }) {
     const radius = 54;
     const circumference = 2 * Math.PI * radius;
     const offset =
          circumference * (1 - Math.max(0, Math.min(100, percent)) / 100);

     return (
          <svg
               viewBox="0 0 128 128"
               role="img"
               aria-label={`Score: ${percent} percent`}
               className="h-40 w-40 shrink-0"
          >
               <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    strokeWidth="10"
                    className="stroke-surface-highest"
               />
               <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 64 64)"
                    className={passed ? "stroke-primary" : "stroke-error"}
               />
               <text
                    x="64"
                    y="70"
                    textAnchor="middle"
                    fontSize="28"
                    fontWeight="700"
                    className="fill-on-surface"
                    style={{ fontFamily: "var(--font-heading)" }}
               >
                    {percent}%
               </text>
          </svg>
     );
}
