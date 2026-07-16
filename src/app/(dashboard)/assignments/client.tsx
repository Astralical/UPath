"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { ClipboardList, Plus, Clock, CheckCircle, AlertCircle, FileText, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  ESSAY: "文书",
  RESEARCH: "调研",
  TEST_PREP: "考试准备",
  APPLICATION_FORM: "申请表格",
  OTHER: "其他",
};

export default function AssignmentsClient({ role }: { role: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", type: "OTHER" });
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submitContent, setSubmitContent] = useState("");

  const fetchAssignments = useCallback(async () => {
    if (role === "TEACHER") {
      const res = await fetch("/api/assignments/teacher");
      if (res.ok) setAssignments(await res.json());
    } else {
      const [aRes, sRes] = await Promise.all([
        fetch("/api/assignments"),
        fetch("/api/assignments/submissions"),
      ]);
      if (aRes.ok) setAssignments(await aRes.json());
      if (sRes.ok) setSubmissions(await sRes.json());
    }
  }, [role]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-gray-500">Loading...</p></div>;
  }
  if (status === "unauthenticated") { router.push("/login"); return null; }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast({ title: "作业已发布", variant: "success" });
      setShowForm(false);
      setForm({ title: "", description: "", dueDate: "", type: "OTHER" });
      fetchAssignments();
    }
  };

  const handleSubmit = async (assignmentId: string) => {
    const res = await fetch("/api/assignments/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, content: submitContent }),
    });
    if (res.ok) {
      toast({ title: "作业已提交", variant: "success" });
      setSubmittingId(null);
      setSubmitContent("");
      fetchAssignments();
    }
  };

  const handleGrade = async (submissionId: string, grade: string, feedback: string) => {
    await fetch("/api/assignments/submissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: submissionId, grade, feedback, status: "GRADED" }),
    });
    toast({ title: "已评分", variant: "success" });
    fetchAssignments();
  };

  const submittedIds = new Set(submissions.map((s) => s.assignmentId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">作业管理</h1>
          <p className="text-gray-500 mt-1">
            {role === "TEACHER" ? "布置和管理学生作业" : "查看和提交作业"}
          </p>
        </div>
        {role === "TEACHER" && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            布置作业
          </Button>
        )}
      </div>

      {/* Create Assignment Form (Teacher) */}
      {showForm && role === "TEACHER" && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>作业标题</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="作业标题" required />
                </div>
                <div className="space-y-2">
                  <Label>作业类型</Label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>截止日期</Label>
                <Input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>作业描述</Label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm resize-y"
                  placeholder="详细描述作业要求..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
                <Button type="submit">发布</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assignments List */}
      <div className="grid gap-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              暂无作业
            </CardContent>
          </Card>
        ) : (
          assignments.map((a) => {
            const isSubmitted = submittedIds.has(a.id);
            const submission = submissions.find((s) => s.assignmentId === a.id);
            return (
              <Card key={a.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{a.title}</h3>
                        <Badge>{TYPE_LABELS[a.type] || a.type}</Badge>
                        {isSubmitted && role === "STUDENT" && (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            已提交
                          </Badge>
                        )}
                        {submission?.status === "GRADED" && (
                          <Badge variant="default">评分: {submission.grade}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{a.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          截止: {formatDate(a.dueDate)}
                        </span>
                        {a.teacher && <span>教师: {a.teacher.name}</span>}
                      </div>
                    </div>

                    {/* Student: Submit */}
                    {role === "STUDENT" && !isSubmitted && (
                      <div>
                        {submittingId === a.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={submitContent}
                              onChange={(e) => setSubmitContent(e.target.value)}
                              rows={3}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                              placeholder="输入你的答案..."
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSubmit(a.id)}>提交</Button>
                              <Button size="sm" variant="ghost" onClick={() => setSubmittingId(null)}>取消</Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => setSubmittingId(a.id)}>
                            <FileText className="h-4 w-4 mr-1" />
                            提交作业
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Teacher: View submissions */}
                    {role === "TEACHER" && (
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        查看提交
                      </Button>
                    )}
                  </div>

                  {/* Submission feedback */}
                  {submission?.feedback && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 text-sm text-blue-800">
                      Teacher feedback: {submission.feedback}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
