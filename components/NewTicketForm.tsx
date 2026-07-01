"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Project = { id: string; name: string };

export function NewTicketForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("LOW");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        if (data[0]) setProjectId(data[0].id);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const attachmentUrls: { url: string; name: string }[] = [];

      for (const file of files) {
        const path = `${projectId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("attachments").getPublicUrl(path);
        attachmentUrls.push({ url: data.publicUrl, name: file.name });
      }

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title, description, priority, attachmentUrls }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create ticket");
      }

      const ticket = await res.json();
      router.push(`/tickets/${ticket.id}`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Project</label>
        <select
          required
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Select a project
          </option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="LOW">Low</option>
          <option value="MID">Mid</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Screenshots (optional)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="w-full text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !projectId}
        className="w-full brand-btn rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit ticket"}
      </button>
    </form>
  );
}
