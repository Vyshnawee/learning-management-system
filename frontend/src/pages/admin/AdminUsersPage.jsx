import { useState } from "react";
import {
     RotateCcw,
     Search,
     SearchX,
     TriangleAlert,
     Users,
     X,
} from "lucide-react";
import { getAdminUsers, setUserActive } from "../../api/adminApi.js";
import { useAdminList } from "../../hooks/useAdminList.js";
import { useQueryFilters } from "../../hooks/useQueryFilters.js";
import EmptyState from "../../components/common/EmptyState.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import Select from "../../components/common/Select.jsx";
import Button from "../../components/common/Button.jsx";
import Alert from "../../components/common/Alert.jsx";
import SuccessNotice from "../../components/common/SuccessNotice.jsx";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { formatDate } from "../../utils/format.js";
import { ROLE_LABELS } from "../../utils/roles.js";

const LIMIT = 10;
const selectUsers = (res) => res.data.users;

const ROLE_STYLES = {
     student: "bg-surface-highest text-on-surface",
     instructor: "bg-secondary/20 text-secondary",
     admin: "bg-primary/15 text-primary",
};

export default function AdminUsersPage() {
     const { searchParams, update, clear } = useQueryFilters();
     const search = searchParams.get("search") || "";
     const role = searchParams.get("role") || "";
     const status = searchParams.get("status") || "";
     const page = Math.max(parseInt(searchParams.get("page"), 10) || 1, 1);

     const list = useAdminList(getAdminUsers, selectUsers, {
          page,
          limit: LIMIT,
          search: search || undefined,
          role: role || undefined,
          status: status || undefined,
     });

     const [confirmId, setConfirmId] = useState(null);
     const [busyId, setBusyId] = useState(null);
     const [actionError, setActionError] = useState("");
     const [notice, setNotice] = useState("");

     const hasFilters = Boolean(search || role || status);

     const handleSearch = (event) => {
          event.preventDefault();
          update({
               search: new FormData(event.currentTarget)
                    .get("search")
                    .toString()
                    .trim(),
          });
     };

     const changeStatus = async (user, isActive) => {
          setBusyId(user._id);
          setActionError("");
          setNotice("");
          try {
               const res = await setUserActive(user._id, isActive);
               list.setItems((items) =>
                    items.map((item) =>
                         item._id === user._id ? res.data.user : item,
                    ),
               );
               setNotice(
                    `${user.name} was ${isActive ? "reactivated" : "suspended"}.`,
               );
               setConfirmId(null);
          } catch (error) {
               setActionError(getErrorMessage(error));
          } finally {
               setBusyId(null);
          }
     };

     return (
          <div className="mx-auto max-w-6xl">
               <header className="mb-8">
                    <h1 className="text-3xl font-bold sm:text-4xl">Users</h1>
                    <p className="mt-2 text-on-surface-variant">
                         Search users and suspend or reactivate accounts. A
                         suspended user is logged out at once and can&apos;t log
                         in until you reactivate them.
                    </p>
               </header>

               <section
                    aria-label="Filters"
                    className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end"
               >
                    <form
                         key={search}
                         onSubmit={handleSearch}
                         role="search"
                         className="relative flex-1"
                    >
                         <label
                              htmlFor="user-search"
                              className="mb-1.5 block text-sm font-medium"
                         >
                              Search
                         </label>
                         <Search
                              size={18}
                              className="pointer-events-none absolute bottom-3 left-3.5 text-outline"
                         />
                         <input
                              id="user-search"
                              name="search"
                              type="search"
                              maxLength={100}
                              defaultValue={search}
                              placeholder="Name or email (press Enter)"
                              className="min-h-11 w-full rounded-lg border border-outline-variant bg-surface-lowest py-2.5 pl-10 pr-10 text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary"
                         />
                         {search && (
                              <button
                                   type="button"
                                   onClick={() => update({ search: "" })}
                                   aria-label="Clear search"
                                   className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center text-outline hover:text-on-surface"
                              >
                                   <X size={18} />
                              </button>
                         )}
                    </form>
                    <Select
                         label="Role"
                         value={role}
                         onChange={(event) =>
                              update({ role: event.target.value })
                         }
                         className="lg:w-44"
                    >
                         <option value="">All roles</option>
                         <option value="student">Students</option>
                         <option value="instructor">Instructors</option>
                         <option value="admin">Admins</option>
                    </Select>
                    <Select
                         label="Status"
                         value={status}
                         onChange={(event) =>
                              update({ status: event.target.value })
                         }
                         className="lg:w-44"
                    >
                         <option value="">All statuses</option>
                         <option value="active">Active</option>
                         <option value="suspended">Suspended</option>
                    </Select>
               </section>

               {actionError && (
                    <div className="mb-4">
                         <Alert>{actionError}</Alert>
                    </div>
               )}
               <div className="mb-4">
                    <SuccessNotice>{notice}</SuccessNotice>
               </div>

               {list.status === "loading" && (
                    <div
                         role="status"
                         aria-label="Loading users"
                         className="h-72 animate-pulse rounded-xl bg-surface-low"
                    />
               )}

               {list.status === "error" && (
                    <EmptyState
                         icon={TriangleAlert}
                         title="Could not load the users"
                         text={list.errorMessage}
                         action={
                              <Button onClick={list.reload}>
                                   <RotateCcw size={16} />
                                   Try again
                              </Button>
                         }
                    />
               )}

               {list.status === "success" && list.items.length === 0 && (
                    <EmptyState
                         icon={hasFilters ? SearchX : Users}
                         title={hasFilters ? "No users found" : "No users yet"}
                         text={
                              hasFilters
                                   ? "Try different words or clear your filters."
                                   : "Users will appear here after they sign up."
                         }
                         action={
                              hasFilters && (
                                   <Button variant="secondary" onClick={clear}>
                                        <RotateCcw size={16} />
                                        Clear all filters
                                   </Button>
                              )
                         }
                    />
               )}

               {list.status === "success" && list.items.length > 0 && (
                    <div className="space-y-4">
                         <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-low">
                              <table className="w-full min-w-[760px] text-left text-sm">
                                   <caption className="sr-only">Users</caption>
                                   <thead className="border-b border-outline-variant bg-surface-container text-xs uppercase tracking-wide text-on-surface-variant">
                                        <tr>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 font-semibold"
                                             >
                                                  User
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 font-semibold"
                                             >
                                                  Role
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 font-semibold"
                                             >
                                                  Joined
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 font-semibold"
                                             >
                                                  Status
                                             </th>
                                             <th
                                                  scope="col"
                                                  className="px-4 py-3 font-semibold"
                                             >
                                                  Action
                                             </th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {list.items.map((user) => {
                                             const confirming =
                                                  confirmId === user._id;
                                             const busy = busyId === user._id;

                                             return (
                                                  <tr
                                                       key={user._id}
                                                       className="border-b border-outline-variant/60 last:border-b-0"
                                                  >
                                                       <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-highest text-sm font-bold">
                                                                      {user.name
                                                                           .charAt(
                                                                                0,
                                                                           )
                                                                           .toUpperCase()}
                                                                 </span>
                                                                 <div className="min-w-0">
                                                                      <p className="truncate font-semibold">
                                                                           {
                                                                                user.name
                                                                           }
                                                                      </p>
                                                                      <p className="truncate text-xs text-on-surface-variant">
                                                                           {
                                                                                user.email
                                                                           }
                                                                      </p>
                                                                 </div>
                                                            </div>
                                                       </td>
                                                       <td className="px-4 py-3">
                                                            <span
                                                                 className={`rounded-md px-2.5 py-1 text-xs font-semibold ${ROLE_STYLES[user.role]}`}
                                                            >
                                                                 {ROLE_LABELS[
                                                                      user.role
                                                                 ] || user.role}
                                                            </span>
                                                       </td>
                                                       <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">
                                                            {formatDate(
                                                                 user.createdAt,
                                                            )}
                                                       </td>
                                                       <td className="px-4 py-3">
                                                            <span
                                                                 className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                                                                      user.isActive
                                                                           ? "bg-primary/15 text-primary"
                                                                           : "bg-error-container/40 text-on-error-container"
                                                                 }`}
                                                            >
                                                                 {user.isActive
                                                                      ? "Active"
                                                                      : "Suspended"}
                                                            </span>
                                                       </td>
                                                       <td className="px-4 py-3">
                                                            {user.role ===
                                                            "admin" ? (
                                                                 <span className="text-xs text-on-surface-variant">
                                                                      Protected
                                                                 </span>
                                                            ) : confirming ? (
                                                                 <div className="space-y-2">
                                                                      <p className="max-w-56 text-xs text-on-surface-variant">
                                                                           Suspend{" "}
                                                                           {
                                                                                user.name
                                                                           }
                                                                           ?
                                                                           They
                                                                           will
                                                                           be
                                                                           logged
                                                                           out
                                                                           and
                                                                           can&apos;t
                                                                           log
                                                                           in.
                                                                      </p>
                                                                      <div className="flex gap-2">
                                                                           <Button
                                                                                loading={
                                                                                     busy
                                                                                }
                                                                                onClick={() =>
                                                                                     changeStatus(
                                                                                          user,
                                                                                          false,
                                                                                     )
                                                                                }
                                                                           >
                                                                                Yes,
                                                                                suspend
                                                                           </Button>
                                                                           <Button
                                                                                variant="secondary"
                                                                                disabled={
                                                                                     busy
                                                                                }
                                                                                onClick={() =>
                                                                                     setConfirmId(
                                                                                          null,
                                                                                     )
                                                                                }
                                                                           >
                                                                                Cancel
                                                                           </Button>
                                                                      </div>
                                                                 </div>
                                                            ) : user.isActive ? (
                                                                 <Button
                                                                      variant="secondary"
                                                                      onClick={() => {
                                                                           setConfirmId(
                                                                                user._id,
                                                                           );
                                                                           setNotice(
                                                                                "",
                                                                           );
                                                                           setActionError(
                                                                                "",
                                                                           );
                                                                      }}
                                                                      disabled={
                                                                           busyId !==
                                                                           null
                                                                      }
                                                                 >
                                                                      Suspend
                                                                 </Button>
                                                            ) : (
                                                                 <Button
                                                                      loading={
                                                                           busy
                                                                      }
                                                                      disabled={
                                                                           busyId !==
                                                                           null
                                                                      }
                                                                      onClick={() =>
                                                                           changeStatus(
                                                                                user,
                                                                                true,
                                                                           )
                                                                      }
                                                                 >
                                                                      Reactivate
                                                                 </Button>
                                                            )}
                                                       </td>
                                                  </tr>
                                             );
                                        })}
                                   </tbody>
                              </table>
                         </div>
                         <Pagination
                              pagination={list.pagination}
                              noun="users"
                              onChange={(newPage) => {
                                   update({
                                        page:
                                             newPage > 1 ? String(newPage) : "",
                                   });
                                   window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                   });
                              }}
                         />
                    </div>
               )}
          </div>
     );
}
