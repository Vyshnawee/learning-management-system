export default function StatCard({ icon: Icon, label, value, hint }) {
     return (
          <div className="rounded-xl border border-outline-variant bg-surface-low p-5">
               <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-on-surface-variant">
                         {label}
                    </p>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-highest text-primary">
                         <Icon size={18} />
                    </span>
               </div>
               <p className="font-heading text-4xl font-bold">{value}</p>
               {hint && (
                    <p className="mt-1 text-sm text-on-surface-variant">
                         {hint}
                    </p>
               )}
          </div>
     );
}
