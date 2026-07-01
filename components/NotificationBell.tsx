"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  message: string;
  ticketId: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  async function refreshCount() {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch {
      // ignore transient network errors
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount
    refreshCount();
    const interval = setInterval(refreshCount, 20000); // poll every 20s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      const res = await fetch("/api/notifications");
      if (res.ok) setNotifications(await res.json());
    }
  }

  async function handleClick(n: Notification) {
    if (!n.readAt) {
      await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.ticketId) router.push(`/tickets/${n.ticketId}`);
  }

  async function markAllRead() {
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
    setUnreadCount(0);
    setNotifications((list) => list.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={toggleOpen} className="relative rounded-lg p-1.5 hover:bg-gray-100" aria-label="Notifications">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium text-white"
            style={{ background: "var(--brand-hover)" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-sm font-medium text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs brand-link hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-gray-400">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`block w-full border-b border-gray-50 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-gray-50 ${
                  n.readAt ? "text-gray-500" : "font-medium text-gray-900"
                }`}
              >
                {n.message}
                <div className="mt-0.5 text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
