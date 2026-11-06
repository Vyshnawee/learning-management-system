// A readable message for any failed request
export const getErrorMessage = (error) => {
     if (error.response) {
          return (
               error.response.data?.message ||
               "Something went wrong. Please try again."
          );
     }
     if (error.code === "ECONNABORTED") {
          return "The request took too long. Please try again.";
     }
     return "Cannot reach the server. Please check that the backend is running.";
};

// Turns the backend's validation list into { email: "Please provide a valid email address" }
export const getFieldErrors = (error) => {
     const list = error.response?.data?.errors;
     if (!Array.isArray(list)) return {};

     const result = {};
     for (const { field, message } of list) {
          if (field && !result[field]) result[field] = message;
     }
     return result;
};
