import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Clock } from "lucide-react";
import { formatDate, timeAgo } from "@/lib/utils";
import Link from "next/link";

export default async function WorkspacePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const statements = await prisma.personalStatement.findMany({
    where: { userId },
    include: { university: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文书工作区</h1>
          <p className="text-gray-500 mt-1">撰写和管理你的个人陈述</p>
        </div>
        <Link href="/workspace/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建文书
          </Button>
        </Link>
      </div>

      {statements.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有文书</h3>
            <p className="text-gray-500 mb-4">创建你的第一篇个人陈述，开启申请之旅</p>
            <Link href="/workspace/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新建文书
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statements.map((stmt) => (
            <Link key={stmt.id} href={`/workspace/${stmt.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{stmt.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {stmt.university && `目标: ${stmt.university.name}`}
                      </CardDescription>
                    </div>
                    <Badge variant={stmt.status === "draft" ? "secondary" : "success"}>
                      {stmt.status === "draft" ? "草稿" : "已完成"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                    {stmt.content || "暂无内容"}
                  </p>
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    更新于 {timeAgo(stmt.updatedAt)} · v{stmt.version}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
