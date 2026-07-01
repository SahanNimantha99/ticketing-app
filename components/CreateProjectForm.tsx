"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateProjectForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        memberEmails: emails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    setName("");
    setEmails("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="brand-btn rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      >
        + New project
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        placeholder="Member emails, comma separated (client + dev, must already have accounts)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="brand-btn rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create project"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
