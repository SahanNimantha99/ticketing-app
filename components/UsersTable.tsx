"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Project = { id: string; name: string };
type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  projectMemberships: { project: Project }[];
};

export function UsersTable({ users, projects }: { users: UserRow[]; projects: Project[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  async function changeRole(userId: string, role: string) {
    setLoadingId(userId);
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setLoadingId(null);
    router.refresh();
  }

  async function addToProject(userId: string, projectId: string) {
    if (!projectId) return;
    setLoadingId(userId);
    await fetch(`/api/users/${userId}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    setLoadingId(null);
    router.refresh();
  }

  async function removeFromProject(userId: string, projectId: string) {
    setLoadingId(userId);
    await fetch(`/api/users/${userId}/projects`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
            <th className="px-4 py-3">Name / Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Projects</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const memberProjectIds = new Set(u.projectMemberships.map((m) => m.project.id));
            const availableProjects = projects.filter((p) => !memberProjectIds.has(p.id));
            return (
              <tr key={u.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{u.name ?? "—"}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    disabled={loadingId === u.id}
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="DEV">Dev</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {u.projectMemberships.map((m) => (
                      <span
                        key={m.project.id}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                      >
                        {m.project.name}
                        <button
                          disabled={loadingId === u.id}
                          onClick={() => removeFromProject(u.id, m.project.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Remove from project"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {availableProjects.length > 0 && (
                      <select
                        disabled={loadingId === u.id}
                        value=""
                        onChange={(e) => addToProject(u.id, e.target.value)}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-600"
                      >
                        <option value="" disabled>
                          + Add to project
                        </option>
                        {availableProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
