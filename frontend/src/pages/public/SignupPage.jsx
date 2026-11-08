import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Alert from "../../components/common/Alert.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
     getErrorMessage,
     getFieldErrors,
} from "../../utils/getErrorMessage.js";
import { getPasswordError, isValidEmail } from "../../utils/validators.js";
import { getDashboardPath } from "../../utils/roles.js";

const roles = [
     { value: "student", label: "Student", text: "I want to learn" },
     { value: "instructor", label: "Instructor", text: "I want to teach" },
];

export default function SignupPage() {
     const { user, register } = useAuth();
     const [searchParams] = useSearchParams();
     // "Start teaching" links to /signup?role=instructor. Anything else starts as a student.
     const initialRole =
          searchParams.get("role") === "instructor" ? "instructor" : "student";

     const [form, setForm] = useState({
          name: "",
          email: "",
          password: "",
          role: initialRole,
     });

     const [fieldErrors, setFieldErrors] = useState({});
     const [formError, setFormError] = useState("");
     const [submitting, setSubmitting] = useState(false);

     // Already logged in (or just registered): go to your dashboard
     if (user) return <Navigate to={getDashboardPath(user.role)} replace />;

     const handleChange = (event) => {
          const { name, value } = event.target;
          setForm((current) => ({ ...current, [name]: value }));
          setFieldErrors((current) => ({ ...current, [name]: "" }));
     };

     const handleSubmit = async (event) => {
          event.preventDefault();
          setFormError("");

          const name = form.name.trim();
          const errors = {};
          if (name.length < 2 || name.length > 50)
               errors.name = "Name must be 2 to 50 characters";
          if (!isValidEmail(form.email.trim()))
               errors.email = "Please enter a valid email address";
          const passwordError = getPasswordError(form.password);
          if (passwordError) errors.password = passwordError;
          setFieldErrors(errors);
          if (Object.keys(errors).length > 0) return;

          setSubmitting(true);
          try {
               await register({
                    name,
                    email: form.email.trim(),
                    password: form.password,
                    role: form.role,
               });
          } catch (error) {
               setFormError(getErrorMessage(error));
               setFieldErrors(getFieldErrors(error));
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <AuthLayout
               title="Create your account"
               subtitle="Join LearnHub and start learning for free."
          >
               <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <Alert>{formError}</Alert>
                    <Input
                         label="Full name"
                         name="name"
                         autoComplete="name"
                         placeholder="Ravi Kumar"
                         value={form.name}
                         onChange={handleChange}
                         error={fieldErrors.name}
                    />
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
                         autoComplete="new-password"
                         placeholder="Create a password"
                         hint="At least 8 characters, with a letter and a number."
                         value={form.password}
                         onChange={handleChange}
                         error={fieldErrors.password}
                    />

                    <div>
                         <p className="mb-1.5 text-sm font-medium">I am a</p>
                         <div
                              role="radiogroup"
                              aria-label="Account type"
                              className="grid grid-cols-2 gap-3"
                         >
                              {roles.map((role) => {
                                   const selected = form.role === role.value;
                                   return (
                                        <button
                                             key={role.value}
                                             type="button"
                                             role="radio"
                                             aria-checked={selected}
                                             onClick={() =>
                                                  setForm((current) => ({
                                                       ...current,
                                                       role: role.value,
                                                  }))
                                             }
                                             className={`rounded-lg border p-3 text-left transition ${
                                                  selected
                                                       ? "border-primary bg-primary/10"
                                                       : "border-outline-variant hover:border-outline"
                                             }`}
                                        >
                                             <span className="block font-semibold">
                                                  {role.label}
                                             </span>
                                             <span className="text-sm text-on-surface-variant">
                                                  {role.text}
                                             </span>
                                        </button>
                                   );
                              })}
                         </div>
                    </div>

                    <Button
                         type="submit"
                         loading={submitting}
                         className="w-full"
                    >
                         Create account
                    </Button>
               </form>
               <p className="mt-6 text-center text-sm text-on-surface-variant">
                    Already have an account?{" "}
                    <Link
                         to="/login"
                         className="font-semibold text-primary hover:underline"
                    >
                         Log in
                    </Link>
               </p>
          </AuthLayout>
     );
}
