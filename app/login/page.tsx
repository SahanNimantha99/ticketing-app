import { signInAction, signUpAction } from "@/app/actions";
import Image from "next/image";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Image src="/brand/logo-icon.png" alt="" width={32} height={32} className="h-8 w-8" />
          <span className="text-lg font-semibold text-gray-900">
            OneCode<span style={{ color: "var(--brand-text)" }}>Labs</span>
          </span>
        </div>
        <h1 className="mb-1 text-lg font-medium text-gray-900">Sign in</h1>
        <p className="mb-4 text-sm text-gray-500">Access your tickets and projects.</p>

        {params.error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{params.error}</p>
        )}
        {params.message && (
          <p className="mb-3 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">{params.message}</p>
        )}

        <form action={signInAction} className="space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="brand-btn w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            Sign in
          </button>
        </form>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500">New client? Create an account</summary>
          <form action={signUpAction} className="mt-3 space-y-3">
            <input
              name="name"
              type="text"
              required
              placeholder="Full name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 chars)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign up
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-400">
            New signups default to the client role. An admin must add you to a project
            and can promote roles directly in the database.
          </p>
        </details>
      </div>
    </div>
  );
}
