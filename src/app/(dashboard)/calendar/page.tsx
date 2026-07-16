"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const EVENT_TYPES: Record<string, { label: string; color: string }> = {
  APPLICATION_DEADLINE: { label: "申请截止", color: "bg-red-100 text-red-800 border-red-200" },
  EXAM_DATE: { label: "考试日期", color: "bg-orange-100 text-orange-800 border-orange-200" },
  INTERVIEW: { label: "面试", color: "bg-purple-100 text-purple-800 border-purple-200" },
  ESSAY_DEADLINE: { label: "文书截止", color: "bg-blue-100 text-blue-800 border-blue-200" },
  DOCUMENT_DEADLINE: { label: "材料截止", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  MEETING: { label: "会议", color: "bg-green-100 text-green-800 border-green-200" },
  PERSONAL: { label: "个人", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", startDate: "", endDate: "", type: "PERSONAL" });

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/calendar");
    if (res.ok) setEvents(await res.json());
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-gray-500">Loading...</p></div>;
  }
  if (status === "unauthenticated") { router.push("/login"); return null; }

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startDate) return;
    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast({ title: "事件已添加", variant: "success" });
      setShowForm(false);
      setForm({ title: "", description: "", startDate: "", endDate: "", type: "PERSONAL" });
      fetchEvents();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/calendar?id=${id}`, { method: "DELETE" });
    toast({ title: "事件已删除" });
    fetchEvents();
  };

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter((e) => {
      const eDate = new Date(e.startDate);
      return eDate.getFullYear() === date.getFullYear() && eDate.getMonth() === date.getMonth() && eDate.getDate() === date.getDate();
    });
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === currentDate.getFullYear() &&
    today.getMonth() === currentDate.getMonth() &&
    today.getDate() === day;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">申请日历</h1>
          <p className="text-gray-500 mt-1">追踪申请截止日期和重要事件</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          添加事件
        </Button>
      </div>

      {/* Add Event Form */}
      {showForm && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>事件标题</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例如：哈佛大学申请截止" required />
                </div>
                <div className="space-y-2">
                  <Label>事件类型</Label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {Object.entries(EVENT_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>开始日期</Label>
                  <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>结束日期</Label>
                  <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="可选描述" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
                <Button type="submit">添加</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary-600" />
                {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
              ))}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 border border-transparent" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                return (
                  <div
                    key={day}
                    className={`h-24 border border-gray-100 rounded p-1 overflow-hidden ${
                      isToday(day) ? "bg-primary-50 border-primary-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isToday(day) ? "text-primary-700" : "text-gray-700"}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className={`text-[10px] px-1 py-0.5 rounded truncate ${EVENT_TYPES[e.type]?.color || "bg-gray-100"}`}
                          title={e.title}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-gray-400">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events List */}
        <Card>
          <CardHeader>
            <CardTitle>即将到来</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">暂无事件</p>
            ) : (
              <div className="space-y-3">
                {events
                  .filter((e) => new Date(e.startDate) >= new Date())
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .slice(0, 10)
                  .map((event) => (
                    <div key={event.id} className="flex items-start justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(event.startDate)}</p>
                        {event.description && (
                          <p className="text-xs text-gray-400 mt-1 truncate">{event.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge className={EVENT_TYPES[event.type]?.color}>{EVENT_TYPES[event.type]?.label}</Badge>
                        <button onClick={() => handleDelete(event.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
