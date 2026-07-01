import Link from "next/link";
import { PriorityBadge, StatusBadge } from "@/components/Badges";

type TicketRow = {
  id: string;
  title: string;
  priority: string;
  status: string;
  project?: { name: string };
  createdBy?: { name: string | null; email: string };
  assignedTo?: { name: string | null; email: string } | null;
  createdAt: string | Date;
};

export function TicketList({ tickets, showProject = true }: { tickets: TicketRow[]; showProject?: boolean }) {
  if (tickets.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">No tickets yet.</p>;
  }

  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
      {tickets.map((t) => (
        <Link
          key={t.id}
          href={`/tickets/${t.id}`}
          className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{t.title}</p>
            <p className="truncate text-xs text-gray-500">
              {showProject && t.project ? `${t.project.name} · ` : ""}
              {t.createdBy?.name ?? t.createdBy?.email}
              {t.assignedTo ? ` · assigned to ${t.assignedTo.name ?? t.assignedTo.email}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={t.priority} />
            <StatusBadge status={t.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
