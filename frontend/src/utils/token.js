const TOKEN_KEY = "lms_token";

export const getToken = () => {
     try {
          return localStorage.getItem(TOKEN_KEY);
     } catch {
          return null;
     }
};

export const setToken = (token) => {
     try {
          localStorage.setItem(TOKEN_KEY, token);
     } catch {
          // Storage can be blocked (private mode); the user will just need to log in again
     }
};

export const clearToken = () => {
     try {
          localStorage.removeItem(TOKEN_KEY);
     } catch {
          // ignore
     }
};
