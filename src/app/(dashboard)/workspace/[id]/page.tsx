import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import EditStatementClient from "./client";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const statement = await prisma.personalStatement.findUnique({
    where: { id: params.id },
  });

  if (!statement || statement.userId !== userId) {
    redirect("/workspace");
  }

  const universities = await prisma.university.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <EditStatementClient statement={statement} universities={universities} />;
}
