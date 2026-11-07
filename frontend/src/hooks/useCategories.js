import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getCategories } from "../api/courseApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

export function useCategories() {
     const [state, setState] = useState({
          status: "loading",
          categories: [],
          errorMessage: "",
     });
     const [reloadKey, setReloadKey] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          setState((current) => ({ ...current, status: "loading" }));

          getCategories()
               .then((res) => {
                    if (!controller.signal.aborted) {
                         setState({
                              status: "success",
                              categories: res.data.categories,
                              errorMessage: "",
                         });
                    }
               })
               .catch((error) => {
                    if (axios.isCancel(error) || controller.signal.aborted)
                         return;
                    setState({
                         status: "error",
                         categories: [],
                         errorMessage: getErrorMessage(error),
                    });
               });

          return () => controller.abort();
     }, [reloadKey]);

     const reload = useCallback(() => setReloadKey((key) => key + 1), []);
     return { ...state, reload };
}
