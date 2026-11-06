// These rules match the backend validators, so users get instant feedback
export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

export const getPasswordError = (password) => {
     if (password.length < 8) return "Password must be at least 8 characters";
     if (!/[A-Za-z]/.test(password)) return "Password must contain a letter";
     if (!/[0-9]/.test(password)) return "Password must contain a number";
     return "";
};
