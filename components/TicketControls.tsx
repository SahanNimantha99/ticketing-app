"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Dev = { id: string; name: string | null; email: string };

export function TicketControls({
  ticketId,
  role,
  status,
  priority,
  assignedToId,
  devs,
}: {
  ticketId: string;
  role: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  devs: Dev[];
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function update(patch: Record<string, any>) {
    setLoading(true);
    await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setLoading(false);
    router.refresh();
  }

  if (role === "CLIENT") {
    if (status === "RESOLVED" || status === "CLOSED") {
      return (
        <button
          disabled={loading}
          onClick={() => update({ status: "OPEN" })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Reopen ticket
        </button>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div>
        <label className="mb-1 block text-xs text-gray-500">Status</label>
        <select
          disabled={loading}
          value={status}
          onChange={(e) => update({ status: e.target.value })}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
        >
          {["OPEN", "ASSIGNED", "IN_PROGRESS", "IN_REVIEW", "RESOLVED", "CLOSED"].map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Priority</label>
        <select
          disabled={loading}
          value={priority}
          onChange={(e) => update({ priority: e.target.value })}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="LOW">Low</option>
          <option value="MID">Mid</option>
          <option value="HIGH">High</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Assigned to</label>
        <select
          disabled={loading}
          value={assignedToId ?? ""}
          onChange={(e) => update({ assignedToId: e.target.value || null })}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="">Unassigned</option>
          {devs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name ?? d.email}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function CommentForm({ ticketId, role }: { ticketId: string; role: string }) {
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    await fetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, isInternal }),
    });
    setMessage("");
    setIsInternal(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        required
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write a reply…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <div className="flex items-center justify-between">
        {role !== "CLIENT" && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
            />
            Internal note (not visible to client)
          </label>
        )}
        <button
          type="submit"
          disabled={loading}
          className="brand-btn rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Posting…" : "Post reply"}
        </button>
      </div>
    </form>
  );
}
