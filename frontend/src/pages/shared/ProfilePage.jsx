import { useState } from "react";
import Input from "../../components/common/Input.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Button from "../../components/common/Button.jsx";
import Alert from "../../components/common/Alert.jsx";
import SuccessNotice from "../../components/common/SuccessNotice.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { changeMyPassword, updateMyProfile } from "../../api/authApi.js";
import {
     getErrorMessage,
     getFieldErrors,
} from "../../utils/getErrorMessage.js";
import { getPasswordError } from "../../utils/validators.js";
import { ROLE_LABELS } from "../../utils/roles.js";

const isHttpUrl = (value) => {
     try {
          return ["http:", "https:"].includes(new URL(value).protocol);
     } catch {
          return false;
     }
};

function ProfileForm() {
     const { user, setUser } = useAuth();
     const [values, setValues] = useState({
          name: user.name,
          bio: user.bio || "",
          profileImage: user.profileImage || "",
     });
     const [fieldErrors, setFieldErrors] = useState({});
     const [formError, setFormError] = useState("");
     const [saved, setSaved] = useState("");
     const [submitting, setSubmitting] = useState(false);

     const trimmed = {
          name: values.name.trim(),
          bio: values.bio.trim(),
          profileImage: values.profileImage.trim(),
     };
     const isDirty =
          trimmed.name !== user.name ||
          trimmed.bio !== (user.bio || "") ||
          trimmed.profileImage !== (user.profileImage || "");

     const handleChange = (event) => {
          const { name, value } = event.target;
          setValues((current) => ({ ...current, [name]: value }));
          setFieldErrors((current) => ({ ...current, [name]: "" }));
          setSaved("");
     };

     const handleSubmit = async (event) => {
          event.preventDefault();
          setFormError("");
          setSaved("");

          const errors = {};
          if (trimmed.name.length < 2 || trimmed.name.length > 50)
               errors.name = "Name must be 2 to 50 characters";
          if (trimmed.profileImage && !isHttpUrl(trimmed.profileImage)) {
               errors.profileImage =
                    "Enter a valid image address (starting with https://)";
          }
          setFieldErrors(errors);
          if (Object.keys(errors).length > 0) return;

          setSubmitting(true);
          try {
               const res = await updateMyProfile(trimmed);
               setUser(res.data.user);
               setValues(trimmed);
               setSaved("Your profile has been updated.");
          } catch (error) {
               setFormError(getErrorMessage(error));
               setFieldErrors(getFieldErrors(error));
          } finally {
               setSubmitting(false);
          }
     };

     const picture =
          trimmed.profileImage && isHttpUrl(trimmed.profileImage)
               ? trimmed.profileImage
               : "";

     return (
          <form
               onSubmit={handleSubmit}
               noValidate
               className="space-y-5 rounded-xl border border-outline-variant bg-surface-low p-5 sm:p-6"
          >
               <div>
                    <h2 className="text-xl font-semibold">Your profile</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                         This is how others see you on LearnHub.
                    </p>
               </div>

               <Alert>{formError}</Alert>
               <SuccessNotice>{saved}</SuccessNotice>

               <div className="flex items-center gap-4">
                    <span className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-highest text-3xl font-bold">
                         {(trimmed.name || user.name).charAt(0).toUpperCase()}
                         {picture && (
                              <img
                                   key={picture}
                                   src={picture}
                                   alt=""
                                   className="absolute inset-0 h-full w-full object-cover"
                                   onError={(event) => {
                                        event.currentTarget.style.display =
                                             "none";
                                   }}
                              />
                         )}
                    </span>
                    <div className="min-w-0">
                         <p className="truncate font-semibold">{user.name}</p>
                         <p className="text-sm text-primary">
                              {ROLE_LABELS[user.role]}
                         </p>
                    </div>
               </div>

               <Input
                    label="Full name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    error={fieldErrors.name}
                    maxLength={50}
               />
               <Input
                    label="Email address"
                    name="email"
                    type="email"
                    value={user.email}
                    disabled
                    readOnly
                    hint="Your email can't be changed."
               />
               <Input
                    label="Profile picture address (optional)"
                    name="profileImage"
                    type="url"
                    value={values.profileImage}
                    onChange={handleChange}
                    error={fieldErrors.profileImage}
                    placeholder="https://example.com/me.jpg"
                    hint="Paste the web address of an image. Leave empty to show your initial."
               />
               <Textarea
                    label="Bio (optional)"
                    name="bio"
                    rows={4}
                    value={values.bio}
                    onChange={handleChange}
                    error={fieldErrors.bio}
                    maxLength={500}
                    placeholder="Tell others a little about yourself."
               />

               <Button type="submit" loading={submitting} disabled={!isDirty}>
                    Save profile
               </Button>
          </form>
     );
}

function PasswordForm() {
     const [values, setValues] = useState({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
     });
     const [fieldErrors, setFieldErrors] = useState({});
     const [formError, setFormError] = useState("");
     const [saved, setSaved] = useState("");
     const [submitting, setSubmitting] = useState(false);

     const handleChange = (event) => {
          const { name, value } = event.target;
          setValues((current) => ({ ...current, [name]: value }));
          setFieldErrors((current) => ({ ...current, [name]: "" }));
          setSaved("");
     };

     const handleSubmit = async (event) => {
          event.preventDefault();
          setFormError("");
          setSaved("");

          const errors = {};
          if (!values.currentPassword)
               errors.currentPassword = "Enter your current password";
          const passwordError = getPasswordError(values.newPassword);
          if (passwordError) errors.newPassword = passwordError;
          else if (values.newPassword === values.currentPassword) {
               errors.newPassword =
                    "New password must be different from the current password";
          }
          if (values.confirmPassword !== values.newPassword)
               errors.confirmPassword = "The passwords don't match";
          setFieldErrors(errors);
          if (Object.keys(errors).length > 0) return;

          setSubmitting(true);
          try {
               await changeMyPassword({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
               });
               setValues({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
               });
               setSaved("Your password has been changed.");
          } catch (error) {
               setFormError(getErrorMessage(error));
               setFieldErrors(getFieldErrors(error));
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <form
               onSubmit={handleSubmit}
               noValidate
               className="space-y-5 rounded-xl border border-outline-variant bg-surface-low p-5 sm:p-6"
          >
               <div>
                    <h2 className="text-xl font-semibold">Change password</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                         Use at least 8 characters, with a letter and a number.
                    </p>
               </div>

               <Alert>{formError}</Alert>
               <SuccessNotice>{saved}</SuccessNotice>

               <Input
                    label="Current password"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={values.currentPassword}
                    onChange={handleChange}
                    error={fieldErrors.currentPassword}
               />
               <Input
                    label="New password"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={values.newPassword}
                    onChange={handleChange}
                    error={fieldErrors.newPassword}
               />
               <Input
                    label="Confirm new password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    error={fieldErrors.confirmPassword}
               />

               <Button type="submit" loading={submitting}>
                    Update password
               </Button>
          </form>
     );
}

export default function ProfilePage() {
     return (
          <div className="mx-auto max-w-5xl">
               <header className="mb-8">
                    <h1 className="text-3xl font-bold sm:text-4xl">
                         Profile and settings
                    </h1>
                    <p className="mt-2 text-on-surface-variant">
                         Manage your details and your password.
                    </p>
               </header>
               <div className="grid items-start gap-6 lg:grid-cols-2">
                    <ProfileForm />
                    <PasswordForm />
               </div>
          </div>
     );
}
