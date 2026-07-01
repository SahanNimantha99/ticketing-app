import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { TicketList } from "@/components/TicketList";
import { AddMemberForm } from "@/components/AddMemberForm";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      tickets: {
        include: { project: true, createdBy: true, assignedTo: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar name={user.name ?? user.email} role={user.role} />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <h1 className="text-xl font-medium text-gray-900">{project.name}</h1>

        <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Members</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            {project.members.map((m) => (
              <li key={m.id}>
                {m.user.name ?? m.user.email} <span className="text-gray-400">({m.user.role})</span>
              </li>
            ))}
            {project.members.length === 0 && <li className="text-gray-400">No members yet.</li>}
          </ul>
          <AddMemberForm projectId={project.id} />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Tickets</h2>
          <TicketList tickets={project.tickets as any} showProject={false} />
        </section>
      </main>
    </div>
  );
}
