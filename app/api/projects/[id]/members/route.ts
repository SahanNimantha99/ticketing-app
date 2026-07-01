import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can add members" }, { status: 403 });
  }

  const { email } = await req.json();
  const member = await prisma.user.findUnique({ where: { email } });

  if (!member) {
    return NextResponse.json(
      { error: "No account with that email yet — ask them to sign up first" },
      { status: 404 }
    );
  }

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId: member.id } },
    update: {},
    create: { projectId, userId: member.id },
  });

  return NextResponse.json({ ok: true });
}
