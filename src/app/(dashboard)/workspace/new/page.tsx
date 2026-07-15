import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PersonalStatementEditor from "./editor";

export default async function NewStatementPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const universities = await prisma.university.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">新建文书</h1>
        <p className="text-gray-500 mt-1">开始撰写你的个人陈述</p>
      </div>
      <PersonalStatementEditor universities={universities} />
    </div>
  );
}
