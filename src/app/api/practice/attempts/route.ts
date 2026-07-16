import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const attempts = await prisma.testAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      testSet: { select: { name: true } },
    },
  });
  return NextResponse.json(attempts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();

  const cat = await prisma.testCategory.findFirst({
    where: { name: body.categoryId },
  });

  if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const attempt = await prisma.testAttempt.create({
    data: {
      userId,
      categoryId: cat.id,
      setId: body.setId || null,
      totalQuestions: body.totalQuestions,
      correctCount: body.correctCount,
      score: body.score,
      answers: body.answers,
      completedAt: new Date(),
    },
  });
  return NextResponse.json(attempt);
}
