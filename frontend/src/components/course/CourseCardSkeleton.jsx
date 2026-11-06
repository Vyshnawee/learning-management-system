export default function CourseCardSkeleton() {
     return (
          <div
               aria-hidden="true"
               className="animate-pulse overflow-hidden rounded-xl border border-outline-variant bg-surface-low"
          >
               <div className="aspect-video bg-surface-container" />
               <div className="space-y-3 p-5">
                    <div className="h-3 w-24 rounded bg-surface-high" />
                    <div className="h-5 w-4/5 rounded bg-surface-high" />
                    <div className="h-4 w-full rounded bg-surface-container" />
                    <div className="h-4 w-2/3 rounded bg-surface-container" />
                    <div className="flex items-center justify-between pt-4">
                         <div className="h-8 w-24 rounded bg-surface-container" />
                         <div className="h-11 w-28 rounded-lg bg-surface-high" />
                    </div>
               </div>
          </div>
     );
}
