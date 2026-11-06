export default function EmptyState({ icon: Icon, title, text, action }) {
     return (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-outline-variant bg-surface-low px-6 py-14 text-center">
               {Icon && (
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-highest text-primary">
                         <Icon size={26} />
                    </span>
               )}
               <h2 className="text-xl font-semibold">{title}</h2>
               {text && (
                    <p className="mt-2 max-w-md text-on-surface-variant">
                         {text}
                    </p>
               )}
               {action && <div className="mt-6">{action}</div>}
          </div>
     );
}
