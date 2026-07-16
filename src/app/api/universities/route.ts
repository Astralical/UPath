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
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: any = { AND: [] };
  if (query) {
    where.AND.push({
      OR: [
        { name: { contains: query } },
        { nameZh: { contains: query } },
        { country: { contains: query } },
      ],
    });
  }
  if (country) where.AND.push({ country: { contains: country } });
  if (where.AND.length === 0) delete where.AND;

  const [universities, total] = await Promise.all([
    prisma.university.findMany({
      where,
      include: {
        rankings: { orderBy: { year: "desc" }, take: 2 },
        _count: { select: { majors: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.university.count({ where }),
  ]);

  return NextResponse.json({ universities, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}
