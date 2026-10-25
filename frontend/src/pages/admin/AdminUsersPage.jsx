import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Shield,
  Calendar,
  Ticket,
  CheckCircle,
  Filter,
  Edit2
} from "lucide-react";
import { adminService } from "../../services/admin.service.js";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorState } from "../../components/common/ErrorState.jsx";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Role change modal state
  const [roleModal, setRoleModal] = useState({
    isOpen: false,
    user: null,
    targetRole: "",
    loading: false
  });

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUsers({
        search,
        role: roleFilter,
        page,
        limit: 20
      });
      setUsers(res.users || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers(1);
  };

  const handleOpenRoleModal = (targetUser, newRole) => {
    if (targetUser.id === currentUser?.id) {
      showToast("You cannot modify your own administrative role.", "error");
      return;
    }
    setRoleModal({
      isOpen: true,
      user: targetUser,
      targetRole: newRole,
      loading: false
    });
  };

  const handleConfirmRoleChange = async () => {
    const { user: targetUser, targetRole } = roleModal;
    if (!targetUser || !targetRole) return;

    try {
      setRoleModal((prev) => ({ ...prev, loading: true }));
      await adminService.updateUserRole(targetUser.id, targetRole);
      showToast(`User ${targetUser.name} role changed to ${targetRole}`, "success");
      setRoleModal({ isOpen: false, user: null, targetRole: "", loading: false });
      await loadUsers(pagination.page);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to update role", "error");
      setRoleModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Review registered accounts, inspect hosted events/bookings, and update user roles.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 font-medium"
        >
          <option value="ALL">All Roles</option>
          <option value="ATTENDEE">Attendees</option>
          <option value="ORGANIZER">Organizers</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadUsers(1)} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match query"
          description="Adjust your search keywords or role filters to view accounts."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                            {u.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
                              {u.name}
                              {isCurrent && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-slate-500">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={u.role} />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <span>{u._count?.events || 0} hosted events</span> •{" "}
                        <span>{u._count?.registrations || 0} bookings</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isCurrent ? (
                          <span className="text-xs text-slate-400 italic">Current Session</span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {u.role !== "ORGANIZER" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenRoleModal(u, "ORGANIZER")}
                                className="text-xs py-1 px-2.5 text-purple-700 border-purple-200 hover:bg-purple-50"
                              >
                                Set Organizer
                              </Button>
                            )}
                            {u.role !== "ATTENDEE" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenRoleModal(u, "ATTENDEE")}
                                className="text-xs py-1 px-2.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                              >
                                Set Attendee
                              </Button>
                            )}
                            {u.role !== "ADMIN" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenRoleModal(u, "ADMIN")}
                                className="text-xs py-1 px-2.5 text-red-700 border-red-200 hover:bg-red-50"
                              >
                                Grant Admin
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadUsers(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => loadUsers(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Role Modification */}
      <ConfirmationDialog
        isOpen={roleModal.isOpen}
        title={`Change ${roleModal.user?.name}'s role?`}
        description={`You are about to change ${roleModal.user?.name}'s role to "${roleModal.targetRole}". This takes effect immediately in the database.`}
        confirmLabel={`Confirm Role Change`}
        cancelLabel="Dismiss"
        variant={roleModal.targetRole === "ADMIN" ? "danger" : "primary"}
        isLoading={roleModal.loading}
        onConfirm={handleConfirmRoleChange}
        onCancel={() => setRoleModal({ isOpen: false, user: null, targetRole: "", loading: false })}
      />
    </div>
  );
}
