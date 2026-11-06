import { Link, NavLink } from "react-router-dom";
import { Award, BookOpen, TrendingUp } from "lucide-react";
import Logo from "../common/Logo.jsx";

const features = [
     {
          icon: BookOpen,
          title: "100% free courses",
          text: "Learn from instructors with no subscriptions, trials or hidden fees.",
     },
     {
          icon: TrendingUp,
          title: "Track your progress",
          text: "Mark lessons complete, take quizzes and pick up where you left off.",
     },
     {
          icon: Award,
          title: "Earn certificates",
          text: "Finish a course and get a certificate you can show anyone.",
     },
];

const tabClass = ({ isActive }) =>
     `flex-1 rounded-md py-2.5 text-center text-sm font-semibold transition ${
          isActive
               ? "bg-primary-container text-on-primary-container"
               : "text-on-surface-variant hover:text-on-surface"
     }`;

export default function AuthLayout({ title, subtitle, children }) {
     return (
          <div className="grid min-h-screen lg:grid-cols-2">
               <aside className="hidden flex-col justify-between border-r border-outline-variant bg-surface-low p-12 lg:flex">
                    <Logo />
                    <div>
                         <h2 className="mb-4 text-5xl font-bold leading-tight">
                              Learn new skills at your own pace,{" "}
                              <span className="text-primary">
                                   completely free.
                              </span>
                         </h2>
                         <p className="mb-10 max-w-md text-lg text-on-surface-variant">
                              High quality video lessons, quizzes and
                              certificates, taught by instructors who love what
                              they do.
                         </p>
                         <ul className="space-y-4">
                              {features.map(
                                   ({
                                        icon: Icon,
                                        title: featureTitle,
                                        text,
                                   }) => (
                                        <li
                                             key={featureTitle}
                                             className="flex gap-4 rounded-xl border border-outline-variant bg-surface-container p-4"
                                        >
                                             <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-highest text-primary">
                                                  <Icon size={20} />
                                             </span>
                                             <div>
                                                  <p className="font-semibold">
                                                       {featureTitle}
                                                  </p>
                                                  <p className="text-sm text-on-surface-variant">
                                                       {text}
                                                  </p>
                                             </div>
                                        </li>
                                   ),
                              )}
                         </ul>
                    </div>
                    <p className="text-sm text-outline">
                         © {new Date().getFullYear()} LearnHub
                    </p>
               </aside>

               <main className="flex flex-col">
                    <header className="flex items-center justify-between p-6">
                         <div className="lg:hidden">
                              <Logo />
                         </div>
                         <Link
                              to="/"
                              className="ml-auto text-sm text-on-surface-variant hover:text-on-surface"
                         >
                              Back to home
                         </Link>
                    </header>

                    <div className="flex flex-1 items-center justify-center px-6 pb-12">
                         <div className="w-full max-w-md">
                              <div className="mb-8 flex rounded-lg border border-outline-variant bg-surface-lowest p-1">
                                   <NavLink to="/login" className={tabClass}>
                                        Log in
                                   </NavLink>
                                   <NavLink to="/signup" className={tabClass}>
                                        Sign up
                                   </NavLink>
                              </div>
                              <h1 className="mb-1 text-3xl font-semibold">
                                   {title}
                              </h1>
                              <p className="mb-6 text-on-surface-variant">
                                   {subtitle}
                              </p>
                              {children}
                         </div>
                    </div>
               </main>
          </div>
     );
}
