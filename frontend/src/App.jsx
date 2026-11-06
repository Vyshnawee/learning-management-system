import { GraduationCap } from "lucide-react";

export default function App() {
     return (
          <div className="flex min-h-screen items-center justify-center p-6">
               <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-low p-8">
                    <div className="mb-4 flex items-center gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                              <GraduationCap size={22} />
                         </div>
                         <span className="font-heading text-xl font-bold">
                              LearnHub
                         </span>
                    </div>
                    <h1 className="mb-2 text-3xl font-semibold">Setup works</h1>
                    <p className="mb-6 text-on-surface-variant">
                         Tailwind, fonts, icons and the design colors are all
                         loaded.
                    </p>
                    <button className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-on-primary transition hover:bg-primary-container">
                         Primary button
                    </button>
               </div>
          </div>
     );
}
