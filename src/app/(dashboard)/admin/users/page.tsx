import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCog, GraduationCap } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { applications: true, files: true, assignmentsCreated: true } },
    },
  });

  const roleCounts = {
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    TEACHER: users.filter((u) => u.role === "TEACHER").length,
    STUDENT: users.filter((u) => u.role === "STUDENT").length,
  };

  const ROLE_BADGES: Record<string, { label: string; className: string }> = {
    ADMIN: { label: "管理员", className: "bg-red-100 text-red-800" },
    TEACHER: { label: "老师", className: "bg-blue-100 text-blue-800" },
    STUDENT: { label: "学生", className: "bg-green-100 text-green-800" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-500 mt-1">管理系统中的所有用户</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-xl font-bold">{roleCounts.ADMIN}</p>
              <p className="text-sm text-gray-500">管理员</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <UserCog className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-xl font-bold">{roleCounts.TEACHER}</p>
              <p className="text-sm text-gray-500">老师</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-xl font-bold">{roleCounts.STUDENT}</p>
              <p className="text-sm text-gray-500">学生</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表 ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">用户</th>
                  <th className="pb-3 font-medium text-gray-500">邮箱</th>
                  <th className="pb-3 font-medium text-gray-500">角色</th>
                  <th className="pb-3 font-medium text-gray-500">申请数</th>
                  <th className="pb-3 font-medium text-gray-500">文件数</th>
                  <th className="pb-3 font-medium text-gray-500">注册时间</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{user.name}</td>
                    <td className="py-3 text-gray-500">{user.email}</td>
                    <td className="py-3">
                      <Badge className={ROLE_BADGES[user.role]?.className}>
                        {ROLE_BADGES[user.role]?.label}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-500">{user._count.applications}</td>
                    <td className="py-3 text-gray-500">{user._count.files}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
