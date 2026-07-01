import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { UsersTable } from "@/components/UsersTable";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [users, projects] = await Promise.all([
    prisma.user.findMany({
      include: { projectMemberships: { include: { project: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar name={user.name ?? user.email} role={user.role} />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Everyone who has signed up. Set their role and which project(s) they belong to.
            People must sign up once before they appear here.
          </p>
        </div>
        <UsersTable users={users} projects={projects} />
      </main>
    </div>
  );
}
