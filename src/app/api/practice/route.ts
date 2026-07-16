import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const setId = searchParams.get("setId");

  // Return test sets for a category
  if (category && !setId && searchParams.get("sets") === "true") {
    const cat = await prisma.testCategory.findFirst({ where: { name: category } });
    if (!cat) return NextResponse.json([], { status: 404 });
    const sets = await prisma.testSet.findMany({
      where: { categoryId: cat.id },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { _count: { select: { questions: true } } },
    });
    return NextResponse.json(sets);
  }

  // Return categories
  if (!category) {
    const categories = await prisma.testCategory.findMany({
      include: { _count: { select: { sets: true } } },
    });
    return NextResponse.json(categories);
  }

  // Return questions for a specific set or category
  const cat = await prisma.testCategory.findFirst({ where: { name: category } });
  if (!cat) return NextResponse.json([], { status: 404 });

  const where: any = { categoryId: cat.id };
  if (setId) where.setId = setId;

  const questions = await prisma.testQuestion.findMany({ where, take: 50 });
  return NextResponse.json(questions);
}
