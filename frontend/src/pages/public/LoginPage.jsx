import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Alert from "../../components/common/Alert.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
     getErrorMessage,
     getFieldErrors,
} from "../../utils/getErrorMessage.js";
import { isValidEmail } from "../../utils/validators.js";

export default function LoginPage() {
     const { user, login } = useAuth();
     const navigate = useNavigate();
     const location = useLocation();
     const redirectTo = location.state?.from?.pathname || "/";

     const [form, setForm] = useState({ email: "", password: "" });
     const [fieldErrors, setFieldErrors] = useState({});
     const [formError, setFormError] = useState("");
     const [submitting, setSubmitting] = useState(false);

     // Already logged in: nothing to do here
     if (user) return <Navigate to="/" replace />;

     const handleChange = (event) => {
          const { name, value } = event.target;
          setForm((current) => ({ ...current, [name]: value }));
          setFieldErrors((current) => ({ ...current, [name]: "" }));
     };

     const handleSubmit = async (event) => {
          event.preventDefault();
          setFormError("");

          const errors = {};
          if (!isValidEmail(form.email.trim()))
               errors.email = "Please enter a valid email address";
          if (!form.password) errors.password = "Password is required";
          setFieldErrors(errors);
          if (Object.keys(errors).length > 0) return;

          setSubmitting(true);
          try {
               await login({
                    email: form.email.trim(),
                    password: form.password,
               });
               navigate(redirectTo, { replace: true });
          } catch (error) {
               setFormError(getErrorMessage(error));
               setFieldErrors(getFieldErrors(error));
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <AuthLayout
               title="Log in to your account"
               subtitle="Enter your email and password to continue learning."
          >
               <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <Alert>{formError}</Alert>
                    <Input
                         label="Email address"
                         name="email"
                         type="email"
                         autoComplete="email"
                         placeholder="you@example.com"
                         value={form.email}
                         onChange={handleChange}
                         error={fieldErrors.email}
                    />
                    <Input
                         label="Password"
                         name="password"
                         type="password"
                         autoComplete="current-password"
                         placeholder="Your password"
                         value={form.password}
                         onChange={handleChange}
                         error={fieldErrors.password}
                    />
                    <Button
                         type="submit"
                         loading={submitting}
                         className="w-full"
                    >
                         Log in
                    </Button>
               </form>
               <p className="mt-6 text-center text-sm text-on-surface-variant">
                    Don&apos;t have an account?{" "}
                    <Link
                         to="/signup"
                         className="font-semibold text-primary hover:underline"
                    >
                         Sign up
                    </Link>
               </p>
          </AuthLayout>
     );
}
