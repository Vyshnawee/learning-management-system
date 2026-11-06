import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext.js";
import { fetchMe, loginUser, registerUser } from "../api/authApi.js";
import { AUTH_LOGOUT_EVENT } from "../api/axiosClient.js";
import { clearToken, getToken, setToken } from "../utils/token.js";

export function AuthProvider({ children }) {
     const [user, setUser] = useState(null);
     // If there is a saved token we must check it before knowing who the user is
     const [loading, setLoading] = useState(Boolean(getToken()));

     // On page load: ask the backend who the saved token belongs to
     useEffect(() => {
          if (!getToken()) return;

          let cancelled = false;
          fetchMe()
               .then((res) => {
                    if (!cancelled) setUser(res.data.user);
               })
               .catch(() => {
                    // Invalid or expired token: the API client has already removed it
               })
               .finally(() => {
                    if (!cancelled) setLoading(false);
               });

          return () => {
               cancelled = true;
          };
     }, []);

     // The API client fires this event when the backend says the session is over
     useEffect(() => {
          const handleLogout = () => setUser(null);
          window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);
          return () =>
               window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
     }, []);

     const login = useCallback(async (credentials) => {
          const res = await loginUser(credentials);
          setToken(res.data.token);
          setUser(res.data.user);
          return res.data.user;
     }, []);

     const register = useCallback(async (details) => {
          const res = await registerUser(details);
          setToken(res.data.token);
          setUser(res.data.user);
          return res.data.user;
     }, []);

     const logout = useCallback(() => {
          clearToken();
          setUser(null);
     }, []);

     const value = useMemo(
          () => ({
               user,
               loading,
               isAuthenticated: Boolean(user),
               login,
               register,
               logout,
               setUser,
          }),
          [user, loading, login, register, logout],
     );

     return (
          <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
     );
}
