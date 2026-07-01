const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MID: "bg-amber-100 text-amber-800",
  HIGH: "bg-red-100 text-red-800",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-gray-100 text-gray-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  IN_REVIEW: "bg-purple-100 text-purple-800",
  RESOLVED: "bg-teal-100 text-teal-800",
  CLOSED: "bg-gray-200 text-gray-600",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority] ?? "bg-gray-100 text-gray-800"}`}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
