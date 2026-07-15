import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { studentId: userId },
    include: { assignment: { select: { title: true } } },
    orderBy: { submittedAt: "desc" },
  });
  return NextResponse.json(submissions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();

  const submission = await prisma.assignmentSubmission.create({
    data: {
      assignmentId: body.assignmentId,
      studentId: userId,
      content: body.content,
    },
  });
  return NextResponse.json(submission);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const submission = await prisma.assignmentSubmission.update({
    where: { id: body.id },
    data: {
      grade: body.grade,
      feedback: body.feedback,
      status: body.status || "GRADED",
    },
  });
  return NextResponse.json(submission);
}
