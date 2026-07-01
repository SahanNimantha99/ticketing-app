import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { CreateProjectForm } from "@/components/CreateProjectForm";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const projects = await prisma.project.findMany({
    include: { _count: { select: { tickets: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar name={user.name ?? user.email} role={user.role} />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-900">Projects</h1>
          <CreateProjectForm />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/admin/projects/${p.id}`}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300"
            >
              <p className="font-medium text-gray-900">{p.name}</p>
              <p className="mt-1 text-sm text-gray-500">
                {p._count.tickets} ticket{p._count.tickets === 1 ? "" : "s"} · {p.status}
              </p>
            </Link>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-gray-400">No projects yet — create your first one above.</p>
          )}
        </div>
      </main>
    </div>
  );
}
