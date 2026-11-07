import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getMyEnrollments } from "../api/enrollmentApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

// Loads the logged-in student's enrollments (used by the dashboard and My Courses)
export function useMyEnrollments(limit = 50) {
     const [state, setState] = useState({
          status: "loading", // loading | success | error
          enrollments: [],
          total: 0,
          errorMessage: "",
     });
     const [reloadKey, setReloadKey] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          setState((current) => ({ ...current, status: "loading" }));

          getMyEnrollments({ limit }, controller.signal)
               .then((res) =>
                    setState({
                         status: "success",
                         enrollments: res.data.enrollments,
                         total: res.pagination.total,
                         errorMessage: "",
                    }),
               )
               .catch((error) => {
                    if (axios.isCancel(error)) return;
                    setState((current) => ({
                         ...current,
                         status: "error",
                         errorMessage: getErrorMessage(error),
                    }));
               });

          return () => controller.abort();
     }, [limit, reloadKey]);

     const reload = useCallback(() => setReloadKey((key) => key + 1), []);

     return { ...state, reload };
}
