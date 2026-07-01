import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      project: true,
      createdBy: true,
      assignedTo: true,
      attachments: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role === "CLIENT" && ticket.createdById !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Clients never see internal notes
  if (user.role === "CLIENT") {
    ticket.comments = ticket.comments.filter((c) => !c.isInternal);
  }

  return NextResponse.json(ticket);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { status, priority, assignedToId } = body as {
    status?: string;
    priority?: string;
    assignedToId?: string | null;
  };

  if (user.role === "CLIENT") {
    // Clients may only reopen their own resolved/closed ticket
    if (ticket.createdById !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (status && status !== "OPEN") {
      return NextResponse.json({ error: "Clients can only reopen tickets" }, { status: 403 });
    }
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...(status ? { status: status as any } : {}),
      ...(priority && user.role !== "CLIENT" ? { priority: priority as any } : {}),
      ...(assignedToId !== undefined && user.role !== "CLIENT" ? { assignedToId } : {}),
    },
  });

  // Notify the client when their ticket is marked resolved (a status change they didn't make themselves)
  if (status === "RESOLVED" && ticket.status !== "RESOLVED" && ticket.createdById !== user.id) {
    await prisma.notification.create({
      data: {
        userId: ticket.createdById,
        ticketId: ticket.id,
        message: `Your ticket "${ticket.title}" was marked resolved`,
      },
    });
  }

  return NextResponse.json(updated);
}
