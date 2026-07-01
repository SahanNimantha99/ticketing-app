import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Returns the Supabase auth user joined with our own User row (role, name).
// Returns null if not logged in.
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const authUser = data.user;
  if (!authUser) return null;

  let profile = await prisma.user.findUnique({ where: { id: authUser.id } });

  // First time we see this auth user — create their profile row.
  // Defaults to CLIENT; promote to ADMIN/DEV manually in the database.
  if (!profile) {
    profile = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email ?? "",
        name: authUser.user_metadata?.name ?? null,
        role: "CLIENT",
      },
    });
  }

  return profile;
}
