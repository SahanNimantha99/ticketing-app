import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { TicketControls, CommentForm } from "@/components/TicketControls";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      project: { include: { members: { include: { user: true } } } },
      createdBy: true,
      assignedTo: true,
      attachments: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) notFound();
  if (user.role === "CLIENT" && ticket.createdById !== user.id) redirect("/dashboard");

  const visibleComments =
    user.role === "CLIENT" ? ticket.comments.filter((c) => !c.isInternal) : ticket.comments;

  const devs = ticket.project.members
    .map((m) => m.user)
    .filter((u) => u.role === "DEV" || u.role === "ADMIN");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar name={user.name ?? user.email} role={user.role} />
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div>
          <p className="text-sm text-gray-500">{ticket.project.name}</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-xl font-medium text-gray-900">{ticket.title}</h1>
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Opened by {ticket.createdBy.name ?? ticket.createdBy.email} on{" "}
            {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="whitespace-pre-wrap text-sm text-gray-800">{ticket.description}</p>

          {ticket.attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {ticket.attachments.map((a) => (
                <a key={a.id} href={a.fileUrl} target="_blank" rel="noreferrer">
                  <img
                    src={a.fileUrl}
                    alt={a.fileName}
                    className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <TicketControls
            ticketId={ticket.id}
            role={user.role}
            status={ticket.status}
            priority={ticket.priority}
            assignedToId={ticket.assignedToId}
            devs={devs}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Conversation</h2>
          {visibleComments.map((c) => (
            <div
              key={c.id}
              className={`rounded-xl border p-3 text-sm ${
                c.isInternal ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"
              }`}
            >
              <p className="mb-1 text-xs text-gray-500">
                {c.user.name ?? c.user.email}
                {c.isInternal ? " · internal note" : ""} ·{" "}
                {new Date(c.createdAt).toLocaleString()}
              </p>
              <p className="whitespace-pre-wrap text-gray-800">{c.message}</p>
            </div>
          ))}
          {visibleComments.length === 0 && (
            <p className="text-sm text-gray-400">No replies yet.</p>
          )}
        </div>

        <CommentForm ticketId={ticket.id} role={user.role} />
      </main>
    </div>
  );
}
