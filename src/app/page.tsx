import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, Calendar, FileText, BookOpen, Users, ArrowRight, CheckCircle, BarChart3, MessageSquare } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">UPath</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">登录</Button>
              </Link>
              <Link href="/register">
                <Button>免费注册</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20 lg:py-28">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm text-primary-700 mb-8">
              🚀 全新的升学管理体验
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              你的
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                升学之路
              </span>
              ，从这里开始
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              UPath 为升学机构提供一站式管理平台 —— 从选校调研、文书撰写、截止日期追踪，
              到标化考试练习、作业管理，全面提升你的申请效率。
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  免费开始使用
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  已有账号？登录
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">全方位升学管理工具</h2>
            <p className="text-lg text-gray-600">为你和你的学生提供一站式解决方案</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="group relative p-6 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">三种角色，各司其职</h2>
            <p className="text-lg text-gray-600">管理员、老师、学生，每个角色都有专属的工作空间</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, i) => (
              <div key={role.title} className="bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
                  <role.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{role.title}</h3>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  {role.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-primary-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">准备好提升你的升学服务了吗？</h2>
          <p className="text-lg text-gray-600 mb-8">加入数百家升学机构，用 UPath 为学生提供更好的服务</p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              立即免费注册
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© 2024 UPath. All rights reserved. 升学管理平台</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  { icon: Search, title: "大学搜索与排名", description: "查询全球大学信息，查看QS和US News排名，对比不同学校的优势和专业设置。" },
  { icon: FileText, title: "文书工作空间", description: "在线编辑个人陈述，版本管理，支持AI辅助写作和语法检查。" },
  { icon: Calendar, title: "截止日期日历", description: "追踪所有申请截止日期，设置个人提醒，可视化时间线管理。" },
  { icon: BookOpen, title: "标化考试练习", description: "SAT、IELTS、TOEFL、ACT 真题库，在线练习与成绩追踪。" },
  { icon: Users, title: "师生协作", description: "老师分配作业，追踪学生进度，实时反馈和沟通。" },
  { icon: BarChart3, title: "申请追踪", description: "Kanban 看板管理每个申请的状态，从规划到录取全程可视。" },
  { icon: MessageSquare, title: "即时通讯", description: "师生之间即时消息沟通，文件共享，高效协作。" },
  { icon: GraduationCap, title: "奖学金数据库", description: "搜索可申请的奖学金，按条件筛选，不错过任何机会。" },
];

const roles = [
  {
    icon: GraduationCap,
    title: "学生",
    items: ["搜索大学和专业信息", "撰写和管理个人陈述", "追踪申请截止日期", "练习标化考试题目", "提交作业和查看反馈", "上传管理申请文件"],
  },
  {
    icon: Users,
    title: "老师",
    items: ["管理学生名单", "分配和批改作业", "查看学生申请进度", "提供文书反馈", "设置截止日期提醒", "与学生在平台上沟通"],
  },
  {
    icon: BarChart3,
    title: "管理员",
    items: ["用户和权限管理", "查看整体数据统计", "管理大学和排名数据", "上传考试题库", "系统设置和配置", "审计日志和安全监控"],
  },
];

const stats = [
  { value: "500+", label: "合作机构" },
  { value: "5000+", label: "收录大学" },
  { value: "50,000+", label: "题库数量" },
  { value: "99.9%", label: "服务可用率" },
];
