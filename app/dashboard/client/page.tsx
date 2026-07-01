import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { TicketList } from "@/components/TicketList";

export default async function ClientDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CLIENT") redirect("/dashboard");

  const [tickets, projectCount] = await Promise.all([
    prisma.ticket.findMany({
      where: { createdById: user.id },
      include: { project: true, createdBy: true, assignedTo: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.projectMember.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar name={user.name ?? user.email} role={user.role} />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-900">Your tickets</h1>
          <Link
            href="/dashboard/client/new"
            className="brand-btn rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            + New ticket
          </Link>
        </div>

        {projectCount === 0 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            You're not on any project yet — ask an admin to add you before creating a ticket.
          </p>
        )}

        <TicketList tickets={tickets as any} />
      </main>
    </div>
  );
}
