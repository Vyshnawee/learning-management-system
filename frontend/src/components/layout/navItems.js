import {
     Award,
     BarChart3,
     BookOpen,
     ClipboardList,
     Compass,
     LayoutDashboard,
     PlusCircle,
     Tags,
     User,
     Users,
} from "lucide-react";

export const navItemsByRole = {
     student: [
          {
               to: "/student/dashboard",
               label: "Dashboard",
               icon: LayoutDashboard,
          },
          { to: "/student/courses", label: "My courses", icon: BookOpen },
          { to: "/courses", label: "Explore catalog", icon: Compass },
          { to: "/student/certificates", label: "Certificates", icon: Award },
          { to: "/student/profile", label: "Profile", icon: User },
     ],
     instructor: [
          {
               to: "/instructor/dashboard",
               label: "Dashboard",
               icon: LayoutDashboard,
          },
          { to: "/instructor/courses", label: "My courses", icon: BookOpen },
          {
               to: "/instructor/courses/new",
               label: "Create course",
               icon: PlusCircle,
          },
          { to: "/instructor/students", label: "Students", icon: Users },
          { to: "/instructor/quizzes", label: "Quizzes", icon: ClipboardList },
          { to: "/instructor/analytics", label: "Analytics", icon: BarChart3 },
          { to: "/instructor/profile", label: "Profile", icon: User },
     ],
     admin: [
          { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/admin/users", label: "Users", icon: Users },
          { to: "/admin/courses", label: "Courses", icon: BookOpen },
          { to: "/admin/categories", label: "Categories", icon: Tags },
          { to: "/admin/enrollments", label: "Enrollments", icon: BarChart3 },
     ],
};
