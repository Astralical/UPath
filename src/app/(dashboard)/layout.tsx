"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Search,
  FileText,
  Calendar,
  FolderOpen,
  BookOpen,
  ClipboardList,
  Users,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navKeys = [
  { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { key: "nav.universities", href: "/universities", icon: Search, roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { key: "nav.workspace", href: "/workspace", icon: FileText, roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { key: "nav.calendar", href: "/calendar", icon: Calendar, roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { key: "nav.drive", href: "/drive", icon: FolderOpen, roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { key: "nav.practice", href: "/practice", icon: BookOpen, roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { key: "nav.assignments", href: "/assignments", icon: ClipboardList, roles: ["TEACHER", "STUDENT"] },
  { key: "nav.messages", href: "/messages", icon: MessageSquare, roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { key: "nav.adminUsers", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
  { key: "nav.adminSettings", href: "/admin/settings", icon: Settings, roles: ["ADMIN"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLang();

  const userRole = (session?.user as any)?.role || "STUDENT";
  const filteredNav = navKeys.filter((item) => item.roles.includes(userRole));

  const roleLabels: Record<string, string> = {
    ADMIN: "admin.roleAdmin",
    TEACHER: "admin.roleTeacher",
    STUDENT: "admin.roleStudent",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <Link href="/dashboard" className="flex items-center gap-2">
                <GraduationCap className="h-7 w-7 text-primary-600" />
                <span className="text-lg font-bold">UPath</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav items={filteredNav} pathname={pathname} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
          <div className="flex items-center gap-2 h-16 px-6 border-b">
            <GraduationCap className="h-7 w-7 text-primary-600" />
            <span className="text-lg font-bold">UPath</span>
          </div>
          <SidebarNav items={filteredNav} pathname={pathname} />
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                {session?.user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{t(roleLabels[userRole] || "admin.roleStudent")}</p>
              </div>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-400 hover:text-gray-600">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <LanguageSwitcher />
              <button className="relative text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              <div className="lg:hidden">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                  {session?.user?.name?.[0] || "U"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarNav({ items, pathname }: { items: typeof navKeys; pathname: string }) {
  const { t } = useLang();
  return (
    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary-50 text-primary-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
