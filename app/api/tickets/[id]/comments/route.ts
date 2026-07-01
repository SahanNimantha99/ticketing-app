import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role === "CLIENT" && ticket.createdById !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { message, isInternal } = body as { message: string; isInternal?: boolean };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      ticketId: id,
      userId: user.id,
      message,
      // Clients can never post internal notes
      isInternal: user.role !== "CLIENT" && !!isInternal,
    },
    include: { user: true },
  });

  return NextResponse.json(comment, { status: 201 });
}
