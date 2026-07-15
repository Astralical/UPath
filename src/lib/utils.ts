import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return "刚刚";
}

export const ROLES = {
  ADMIN: "管理员",
  TEACHER: "老师",
  STUDENT: "学生",
} as const;

export const APP_STATUS_MAP: Record<string, string> = {
  PLANNING: "规划中",
  RESEARCHING: "调研中",
  DOCUMENTS: "准备材料",
  WRITING_ESSAY: "撰写文书",
  READY_TO_SUBMIT: "待提交",
  SUBMITTED: "已提交",
  INTERVIEW: "面试中",
  WAITING: "等待结果",
  ACCEPTED: "已录取",
  REJECTED: "未录取",
  DEFERRED: "延期",
};

export const TEST_CATEGORIES = ["SAT", "IELTS", "TOEFL", "ACT"] as const;

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PLANNING: "bg-gray-100 text-gray-800",
    RESEARCHING: "bg-blue-100 text-blue-800",
    DOCUMENTS: "bg-yellow-100 text-yellow-800",
    WRITING_ESSAY: "bg-purple-100 text-purple-800",
    READY_TO_SUBMIT: "bg-orange-100 text-orange-800",
    SUBMITTED: "bg-green-100 text-green-800",
    INTERVIEW: "bg-indigo-100 text-indigo-800",
    WAITING: "bg-cyan-100 text-cyan-800",
    ACCEPTED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
    DEFERRED: "bg-amber-100 text-amber-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
