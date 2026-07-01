import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects =
    user.role === "ADMIN"
      ? await prisma.project.findMany({
          include: { members: { include: { user: true } }, _count: { select: { tickets: true } } },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.project.findMany({
          where: { members: { some: { userId: user.id } } },
          include: { _count: { select: { tickets: true } } },
          orderBy: { createdAt: "desc" },
        });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can create projects" }, { status: 403 });
  }

  const body = await req.json();
  const { name, memberEmails } = body as { name: string; memberEmails?: string[] };

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const project = await prisma.project.create({ data: { name } });

  if (memberEmails?.length) {
    const users = await prisma.user.findMany({ where: { email: { in: memberEmails } } });
    await prisma.projectMember.createMany({
      data: users.map((u: { id: string }) => ({ projectId: project.id, userId: u.id })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json(project, { status: 201 });
}
