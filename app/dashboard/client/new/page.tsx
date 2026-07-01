import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { NewTicketForm } from "@/components/NewTicketForm";

export default async function NewTicketPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar name={user.name ?? user.email} role={user.role} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-xl font-medium text-gray-900">New ticket</h1>
        <NewTicketForm />
      </main>
    </div>
  );
}
