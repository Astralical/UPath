import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  if (!category) {
    const categories = await prisma.testCategory.findMany();
    return NextResponse.json(categories);
  }

  const cat = await prisma.testCategory.findFirst({
    where: { name: category },
  });

  if (!cat) {
    return NextResponse.json([], { status: 404 });
  }

  const questions = await prisma.testQuestion.findMany({
    where: { categoryId: cat.id },
    take: 20,
  });

  return NextResponse.json(questions);
}
