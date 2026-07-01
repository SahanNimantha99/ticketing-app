import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "ADMIN") redirect("/dashboard/admin");
  if (user.role === "DEV") redirect("/dashboard/dev");
  redirect("/dashboard/client");
}
