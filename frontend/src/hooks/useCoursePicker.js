import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useInstructorDashboard } from "./useInstructorDashboard.js";

export function useCoursePicker() {
     const { status, data, errorMessage, reload } = useInstructorDashboard();
     const [searchParams, setSearchParams] = useSearchParams();

     const courses = useMemo(() => data?.perCourse ?? [], [data]);
     const requested = searchParams.get("course");

     // The course in the URL, or the most recently updated one
     const selected =
          courses.find((course) => course.courseId === requested) ||
          courses[0] ||
          null;

     const selectCourse = (courseId) =>
          setSearchParams({ course: courseId }, { replace: true });

     return { status, courses, selected, selectCourse, errorMessage, reload };
}
