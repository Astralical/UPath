import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  FileText,
  Calendar,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatDate, APP_STATUS_MAP, getStatusColor } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  // Fetch stats based on role
  const applications = await prisma.application.findMany({
    where: userRole === "STUDENT" ? { studentId: userId } : {},
    include: { university: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const upcomingEvents = await prisma.calendarEvent.findMany({
    where: { userId, startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
    take: 5,
  });

  const appCount = await prisma.application.count({
    where: userRole === "STUDENT" ? { studentId: userId } : {},
  });

  const eventCount = await prisma.calendarEvent.count({
    where: { userId, startDate: { gte: new Date() } },
  });

  const fileCount = await prisma.file.count({
    where: { userId },
  });

  const assignmentCount = await prisma.assignment.count({
    where: userRole === "TEACHER" ? { teacherId: userId } : {},
  });

  // Student-specific: pending assignments
  let pendingAssignments: any[] = [];
  if (userRole === "STUDENT") {
    pendingAssignments = await prisma.assignment.findMany({
      where: {
        submissions: { none: { studentId: userId } },
        dueDate: { gte: new Date() },
      },
      include: { teacher: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    });
  }

  // Teacher: recent submissions
  let recentSubmissions: any[] = [];
  if (userRole === "TEACHER") {
    recentSubmissions = await prisma.assignmentSubmission.findMany({
      where: { assignment: { teacherId: userId } },
      include: { student: { select: { name: true } }, assignment: { select: { title: true } } },
      orderBy: { submittedAt: "desc" },
      take: 5,
    });
  }

  // Admin stats
  let totalUsers = 0;
  let totalUniversities = 0;
  if (userRole === "ADMIN") {
    totalUsers = await prisma.user.count();
    totalUniversities = await prisma.university.count();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          欢迎回来，{session.user.name}
        </h1>
        <p className="text-gray-500 mt-1">
          {userRole === "ADMIN" ? "系统管理面板" : userRole === "TEACHER" ? "教师工作台" : "学生工作台"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={GraduationCap}
          label="申请数量"
          value={appCount}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatsCard
          icon={Calendar}
          label="即将截止"
          value={eventCount}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <StatsCard
          icon={FileText}
          label="文件数量"
          value={fileCount}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        {userRole === "ADMIN" ? (
          <StatsCard
            icon={TrendingUp}
            label="系统用户"
            value={totalUsers}
            color="text-green-600"
            bg="bg-green-50"
          />
        ) : (
          <StatsCard
            icon={BookOpen}
            label={userRole === "TEACHER" ? "布置作业" : "待交作业"}
            value={userRole === "TEACHER" ? assignmentCount : pendingAssignments.length}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary-600" />
              最近申请
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">暂无申请记录</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-sm">{app.university.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(app.updatedAt)}</p>
                    </div>
                    <Badge className={getStatusColor(app.status)}>
                      {APP_STATUS_MAP[app.status] || app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events / Pending Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {userRole === "STUDENT" ? (
                <>
                  <Clock className="h-5 w-5 text-orange-600" />
                  待完成作业
                </>
              ) : userRole === "TEACHER" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  最近提交
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 text-primary-600" />
                  即将到来的事件
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userRole === "STUDENT" ? (
              pendingAssignments.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">暂无待完成作业 🎉</p>
              ) : (
                <div className="space-y-3">
                  {pendingAssignments.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-sm">{a.title}</p>
                        <p className="text-xs text-gray-500">老师: {a.teacher.name} · 截止: {formatDate(a.dueDate)}</p>
                      </div>
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                    </div>
                  ))}
                </div>
              )
            ) : userRole === "TEACHER" ? (
              recentSubmissions.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">暂无学生提交</p>
              ) : (
                <div className="space-y-3">
                  {recentSubmissions.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-sm">{s.student.name}</p>
                        <p className="text-xs text-gray-500">{s.assignment.title}</p>
                      </div>
                      <Badge variant="secondary">{formatDate(s.submittedAt)}</Badge>
                    </div>
                  ))}
                </div>
              )
            ) : (
              upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">暂无即将到来的事件</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(event.startDate)}</p>
                      </div>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin-only section */}
      {userRole === "ADMIN" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              系统概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-2xl font-bold text-primary-600">{totalUsers}</p>
                <p className="text-sm text-gray-500">总用户数</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-2xl font-bold text-primary-600">{totalUniversities}</p>
                <p className="text-sm text-gray-500">收录大学</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-2xl font-bold text-primary-600">{appCount}</p>
                <p className="text-sm text-gray-500">总申请数</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-2xl font-bold text-primary-600">{fileCount}</p>
                <p className="text-sm text-gray-500">文件总数</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatsCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
