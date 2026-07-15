import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Database, Shield, Bell } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-500 mt-1">管理平台配置</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary-600" />
              数据管理
            </CardTitle>
            <CardDescription>管理大学数据、排名信息和题库</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-gray-50 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">大学数据</p>
                <p className="text-xs text-gray-500">导入/导出大学和排名数据</p>
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">管理</button>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">题库管理</p>
                <p className="text-xs text-gray-500">上传和管理考试题目</p>
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">管理</button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" />
              安全设置
            </CardTitle>
            <CardDescription>平台安全与权限配置</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-gray-50 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">角色权限</p>
                <p className="text-xs text-gray-500">配置各角色的访问权限</p>
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">配置</button>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">会话管理</p>
                <p className="text-xs text-gray-500">查看和管理活跃会话</p>
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">查看</button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-600" />
              通知设置
            </CardTitle>
            <CardDescription>配置系统通知和提醒</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">通知功能将在后续版本中完善</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary-600" />
              系统信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">版本</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">框架</span>
                <span className="font-medium">Next.js 14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">数据库</span>
                <span className="font-medium">SQLite (Prisma)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">认证</span>
                <span className="font-medium">NextAuth.js</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
