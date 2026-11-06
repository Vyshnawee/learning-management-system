import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo({ to = "/" }) {
     return (
          <Link to={to} className="inline-flex items-center gap-2.5">
               <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                    <GraduationCap size={20} />
               </span>
               <span className="font-heading text-xl font-bold">LearnHub</span>
          </Link>
     );
}
