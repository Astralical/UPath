import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Student gets all assignments, Teacher gets their assignments
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role === "TEACHER") {
    const assignments = await prisma.assignment.findMany({
      where: { teacherId: userId },
      include: { submissions: { include: { student: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assignments);
  }

  const assignments = await prisma.assignment.findMany({
    include: { teacher: { select: { name: true } } },
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json(assignments);
}

// POST: Teacher creates assignment
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "TEACHER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const userId = (session.user as any).id;
  const body = await req.json();

  const assignment = await prisma.assignment.create({
    data: {
      teacherId: userId,
      title: body.title,
      description: body.description,
      dueDate: new Date(body.dueDate),
      type: body.type || "OTHER",
    },
  });
  return NextResponse.json(assignment);
}
