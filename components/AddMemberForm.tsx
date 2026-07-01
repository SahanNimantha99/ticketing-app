"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddMemberForm({ projectId }: { projectId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }
    setEmail("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Add member by email"
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
