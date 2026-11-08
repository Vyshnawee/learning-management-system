import { useSearchParams } from "react-router-dom";

export function useQueryFilters() {
     const [searchParams, setSearchParams] = useSearchParams();

     // Change filters. Any change except the page number goes back to page 1.
     const update = (changes) => {
          const next = new URLSearchParams(searchParams);
          Object.entries(changes).forEach(([key, value]) => {
               if (value) next.set(key, value);
               else next.delete(key);
          });
          if (!("page" in changes)) next.delete("page");
          setSearchParams(next);
     };

     const clear = () => setSearchParams({});

     return { searchParams, update, clear };
}
