export const ROLE_LABELS = {
     student: "Student",
     instructor: "Instructor",
     admin: "Admin",
};

// Where each role lands after logging in
export const getDashboardPath = (role) => `/${role}/dashboard`;

// Can this role open this path? Pages under /student, /instructor or /admin belong to one role.
export const canVisit = (pathname, role) => {
     const owner = ["student", "instructor", "admin"].find(
          (prefix) =>
               pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`),
     );
     return !owner || owner === role;
};
