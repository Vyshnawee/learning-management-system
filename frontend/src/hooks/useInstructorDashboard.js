import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { getInstructorDashboard } from "../api/instructorApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

// Loads the instructor's numbers and courses (used by the dashboard and My courses)
export function useInstructorDashboard() {
     const [state, setState] = useState({
          status: "loading",
          data: null,
          errorMessage: "",
     });
     const [reloadKey, setReloadKey] = useState(0);
     const silentRef = useRef(false);

     useEffect(() => {
          const controller = new AbortController();
          const silent = silentRef.current;
          silentRef.current = false;

          // A silent refresh keeps the current page on screen instead of showing the loader again
          if (!silent)
               setState((current) => ({ ...current, status: "loading" }));

          getInstructorDashboard(controller.signal)
               .then((res) =>
                    setState({
                         status: "success",
                         data: res.data,
                         errorMessage: "",
                    }),
               )
               .catch((error) => {
                    if (axios.isCancel(error) || silent) return;
                    setState((current) => ({
                         ...current,
                         status: "error",
                         errorMessage: getErrorMessage(error),
                    }));
               });

          return () => controller.abort();
     }, [reloadKey]);

     const reload = useCallback(() => setReloadKey((key) => key + 1), []);
     const refresh = useCallback(() => {
          silentRef.current = true;
          setReloadKey((key) => key + 1);
     }, []);

     return { ...state, reload, refresh };
}
