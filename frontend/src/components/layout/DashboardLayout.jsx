import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import Logo from "../common/Logo.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { navItemsByRole } from "./navItems.js";
import { ROLE_LABELS, getDashboardPath } from "../../utils/roles.js";

const getInitials = (name = "") =>
     name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0].toUpperCase())
          .join("");

const linkClass = ({ isActive }) =>
     `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
          isActive
               ? "bg-primary-container/15 text-primary"
               : "text-on-surface-variant hover:bg-surface-high hover:text-on-surface"
     }`;

function SidebarContent({ user, onNavigate, onClose, onLogout }) {
     const items = navItemsByRole[user.role] || [];

     return (
          <>
               <div className="flex items-center justify-between p-5">
                    <Logo to={getDashboardPath(user.role)} />
                    {onClose && (
                         <button
                              onClick={onClose}
                              aria-label="Close menu"
                              className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-high"
                         >
                              <X size={20} />
                         </button>
                    )}
               </div>

               <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-wider text-outline">
                    {ROLE_LABELS[user.role]} menu
               </p>

               <nav
                    aria-label="Main"
                    className="flex-1 space-y-1 overflow-y-auto px-3"
               >
                    {items.map(({ to, label, icon: Icon }) => (
                         <NavLink
                              key={to}
                              to={to}
                              end
                              onClick={onNavigate}
                              className={linkClass}
                         >
                              <Icon size={19} />
                              {label}
                         </NavLink>
                    ))}
               </nav>

               <div className="border-t border-outline-variant p-3">
                    <div className="mb-2 flex items-center gap-3 rounded-lg bg-surface-container p-3">
                         <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container">
                              {getInitials(user.name)}
                         </span>
                         <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                   {user.name}
                              </p>
                              <p className="text-xs text-primary">
                                   {ROLE_LABELS[user.role]}
                              </p>
                         </div>
                    </div>
                    <button
                         onClick={onLogout}
                         className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-on-surface-variant transition hover:bg-surface-high hover:text-on-surface"
                    >
                         <LogOut size={19} />
                         Log out
                    </button>
               </div>
          </>
     );
}

export default function DashboardLayout() {
     const { user, logout } = useAuth();
     const navigate = useNavigate();
     const [menuOpen, setMenuOpen] = useState(false);

     // Close the mobile menu with the Escape key
     useEffect(() => {
          if (!menuOpen) return;
          const onKeyDown = (event) =>
               event.key === "Escape" && setMenuOpen(false);
          window.addEventListener("keydown", onKeyDown);
          return () => window.removeEventListener("keydown", onKeyDown);
     }, [menuOpen]);

     const handleLogout = () => {
          logout();
          navigate("/login", { replace: true });
     };

     return (
          <div className="min-h-screen lg:flex">
               {/* Desktop sidebar: full height, stays in place while the page scrolls */}
               <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-low lg:flex">
                    <SidebarContent user={user} onLogout={handleLogout} />
               </aside>

               <div className="flex min-w-0 flex-1 flex-col">
                    {/* Mobile top bar */}
                    <header className="flex items-center justify-between border-b border-outline-variant bg-surface-low px-4 py-3 lg:hidden">
                         <button
                              onClick={() => setMenuOpen(true)}
                              aria-label="Open menu"
                              className="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface hover:bg-surface-high"
                         >
                              <Menu size={22} />
                         </button>
                         <Logo to={getDashboardPath(user.role)} />
                         <span className="w-11" />
                    </header>

                    <main className="flex-1 p-6 lg:p-8">
                         <Outlet />
                    </main>
               </div>

               {/* Mobile drawer */}
               {menuOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                         <button
                              aria-label="Close menu"
                              onClick={() => setMenuOpen(false)}
                              className="absolute inset-0 bg-black/60"
                         />
                         <aside className="relative flex h-full w-72 max-w-[85%] flex-col border-r border-outline-variant bg-surface-low">
                              <SidebarContent
                                   user={user}
                                   onNavigate={() => setMenuOpen(false)}
                                   onClose={() => setMenuOpen(false)}
                                   onLogout={handleLogout}
                              />
                         </aside>
                    </div>
               )}
          </div>
     );
}
