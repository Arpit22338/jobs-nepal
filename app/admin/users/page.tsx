"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  isPremium: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? "unban" : "ban"} this user?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !currentStatus }),
      });
      
      if (res.ok) {
        fetchUsers();
      } else {
        alert("Action failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error performing action");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user permanently? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error performing action");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const paginatedUsers = filteredUsers.slice(0, page * perPage);
  const hasMore = paginatedUsers.length < filteredUsers.length;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users Management</h1>
          <p className="text-muted-foreground text-sm">{filteredUsers.length} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Roles</option>
          <option value="JOBSEEKER">Job Seekers</option>
          <option value="EMPLOYER">Employers</option>
          <option value="TEACHER">Teachers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-card rounded-2xl border border-border">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left text-sm font-semibold text-foreground">Name</th>
              <th className="p-4 text-left text-sm font-semibold text-foreground">Role</th>
              <th className="p-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="p-4 text-left text-sm font-semibold text-foreground">Joined</th>
              <th className="p-4 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-foreground">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === "ADMIN" ? "bg-purple-500/20 text-purple-400" :
                    user.role === "EMPLOYER" ? "bg-blue-500/20 text-blue-400" :
                    user.role === "TEACHER" ? "bg-green-500/20 text-green-400" :
                    "bg-accent text-muted-foreground"
                  }`}>{user.role}</span>
                  {user.isPremium && <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">Premium</span>}
                </td>
                <td className="p-4">
                  {user.isBanned ? (
                    <span className="text-red-400 font-bold text-sm flex items-center gap-1">
                      <i className="bx bx-block"></i> Banned
                    </span>
                  ) : (
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <i className="bx bx-check-circle"></i> Active
                    </span>
                  )}
                </td>
                <td className="p-4 text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  {user.role === "ADMIN" ? (
                    <span className="text-xs text-muted-foreground">Protected</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBan(user.id, user.isBanned)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          user.isBanned 
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" 
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        }`}
                      >
                        {user.isBanned ? "Unban" : "Ban"}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/20 text-destructive hover:bg-destructive/30"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-2.5 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-accent transition-colors"
          >
            Load More ({filteredUsers.length - paginatedUsers.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
