import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { TicketList } from "@/components/TicketList";

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MID: 1, LOW: 2 };

export default async function DevDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "DEV" && user.role !== "ADMIN") redirect("/dashboard");

  const tickets = await prisma.ticket.findMany({
    where:
      user.role === "ADMIN"
        ? {}
        : { project: { members: { some: { userId: user.id } } } },
    include: { project: true, createdBy: true, assignedTo: true },
  });

  tickets.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const unassigned = tickets.filter((t) => !t.assignedToId && t.status !== "CLOSED");
  const mine = tickets.filter((t) => t.assignedToId === user.id && t.status !== "CLOSED");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar name={user.name ?? user.email} role={user.role} />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div>
          <h1 className="mb-3 text-xl font-medium text-gray-900">My tickets</h1>
          <TicketList tickets={mine as any} />
        </div>
        <div>
          <h2 className="mb-3 text-lg font-medium text-gray-900">Unassigned queue (by priority)</h2>
          <TicketList tickets={unassigned as any} />
        </div>
      </main>
    </div>
  );
}
