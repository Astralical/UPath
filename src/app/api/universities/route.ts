import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const country = searchParams.get("country") || "";

  const universities = await prisma.university.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { name: { contains: query } },
                { nameZh: { contains: query } },
                { country: { contains: query } },
              ],
            }
          : {},
        country ? { country: { contains: country } } : {},
      ],
    },
    include: {
      rankings: { orderBy: { year: "desc" }, take: 2 },
      _count: { select: { majors: true } },
    },
    orderBy: { name: "asc" },
    take: 50,
  });

  return NextResponse.json(universities);
}
