import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getErrorMessage } from "../utils/getErrorMessage.js";

// fetcher(params, signal) returns the API response. select(res) picks the list out of res.data.
// Both must be stable functions (defined outside the component).
export function useAdminList(fetcher, select, params) {
     const key = JSON.stringify(params);
     const [state, setState] = useState({
          status: "loading",
          items: [],
          pagination: null,
          errorMessage: "",
     });
     const [reloadKey, setReloadKey] = useState(0);

     useEffect(() => {
          const controller = new AbortController();
          setState((current) => ({ ...current, status: "loading" }));

          fetcher(JSON.parse(key), controller.signal)
               .then((res) =>
                    setState({
                         status: "success",
                         items: select(res),
                         pagination: res.pagination,
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
     }, [fetcher, select, key, reloadKey]);

     const reload = useCallback(() => setReloadKey((value) => value + 1), []);
     // Lets a page update one row after an action, without loading the whole list again
     const setItems = useCallback(
          (updater) =>
               setState((current) => ({
                    ...current,
                    items: updater(current.items),
               })),
          [],
     );

     return { ...state, reload, setItems };
}
