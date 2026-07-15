import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  universityId: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const validated = schema.parse(body);

  const statement = await prisma.personalStatement.create({
    data: {
      userId,
      title: validated.title,
      content: validated.content || "",
      universityId: validated.universityId || null,
    },
  });

  return NextResponse.json(statement);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const { id, title, content, universityId } = body;

  const existing = await prisma.personalStatement.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const statement = await prisma.personalStatement.update({
    where: { id },
    data: {
      title,
      content,
      universityId,
      version: { increment: 1 },
    },
  });

  return NextResponse.json(statement);
}
