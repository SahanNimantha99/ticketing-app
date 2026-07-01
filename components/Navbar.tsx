import Link from "next/link";
import Image from "next/image";
import { signOutAction } from "@/app/actions";
import { NotificationBell } from "@/components/NotificationBell";

export function Navbar({ name, role }: { name: string; role: string }) {
  const homeHref =
    role === "ADMIN" ? "/dashboard/admin" : role === "DEV" ? "/dashboard/dev" : "/dashboard/client";

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href={homeHref} className="flex items-center gap-2">
          <Image src="/brand/logo-icon.png" alt="" width={28} height={28} className="h-7 w-7" />
          <span className="font-semibold text-gray-900">
            OneCode<span style={{ color: "var(--brand-text)" }}>Labs</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {role === "ADMIN" && (
            <Link href="/dashboard/admin/users" className="hover:text-gray-900">
              Users
            </Link>
          )}
          <NotificationBell />
          <span>
            {name} <span className="text-gray-400">({role})</span>
          </span>
          <form action={signOutAction}>
            <button className="text-gray-600 hover:text-gray-900" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
