import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendNewTicketEmail } from "@/lib/email";

// Priority ordering used to sort the dev queue: high first
const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MID: 1, LOW: 2 };

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;

  const where: any = {};
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (priority) where.priority = priority;

  if (user.role === "CLIENT") {
    where.createdById = user.id;
  } else if (user.role === "DEV") {
    where.project = { members: { some: { userId: user.id } } };
  }
  // ADMIN sees everything matching the filters

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      project: true,
      createdBy: true,
      assignedTo: true,
      _count: { select: { comments: true, attachments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  tickets.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, title, description, priority, attachmentUrls } = body as {
    projectId: string;
    title: string;
    description: string;
    priority: "LOW" | "MID" | "HIGH";
    attachmentUrls?: { url: string; name: string }[];
  };

  if (!projectId || !title || !description) {
    return NextResponse.json({ error: "projectId, title and description are required" }, { status: 400 });
  }

  // Clients may only create tickets in a project they belong to
  if (user.role === "CLIENT") {
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId: user.id },
    });
    if (!membership) {
      return NextResponse.json({ error: "You are not a member of this project" }, { status: 403 });
    }
  }

  const ticket = await prisma.ticket.create({
    data: {
      projectId,
      title,
      description,
      priority: priority ?? "LOW",
      createdById: user.id,
      attachments: attachmentUrls?.length
        ? { create: attachmentUrls.map((a) => ({ fileUrl: a.url, fileName: a.name })) }
        : undefined,
    },
  });

  // Notify the company side: everyone with role ADMIN, plus devs assigned to this project.
  const [admins, project] = await Promise.all([
    prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true, email: true } }),
    prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    }),
  ]);

  const devs = (project?.members ?? []).map((m) => m.user).filter((u) => u.role === "DEV");

  // De-duplicate recipients (an admin could also be a project member)
  const recipientUsers = Array.from(
    new Map([...admins, ...devs].map((u) => [u.id, u])).values()
  );

  // In-app notification bell for each admin/dev
  if (recipientUsers.length > 0) {
    await prisma.notification.createMany({
      data: recipientUsers.map((r) => ({
        userId: r.id,
        ticketId: ticket.id,
        message: `${user.name ?? user.email} opened a new ${ticket.priority} priority ticket "${title}" on ${project?.name ?? "a project"}`,
      })),
    });
  }

  // Email, same recipient list, with a fallback if no admins/devs exist yet
  const recipientEmails = recipientUsers.map((r) => r.email);
  if (recipientEmails.length === 0 && process.env.COMPANY_NOTIFICATION_EMAIL) {
    recipientEmails.push(process.env.COMPANY_NOTIFICATION_EMAIL);
  }

  await sendNewTicketEmail({
    to: recipientEmails,
    ticketId: ticket.id,
    title,
    description,
    priority: ticket.priority,
    projectName: project?.name ?? "",
    clientName: user.name ?? user.email,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin,
  });

  return NextResponse.json(ticket, { status: 201 });
}
