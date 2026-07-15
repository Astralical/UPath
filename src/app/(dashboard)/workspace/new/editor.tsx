"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";

export default function PersonalStatementEditor({
  universities,
}: {
  universities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "请输入文书标题", variant: "destructive" });
      return;
    }
    setSaving(true);
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        content,
        universityId: universityId || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      toast({ title: "文书已保存", variant: "success" });
      router.push(`/workspace/${data.id}`);
    } else {
      toast({ title: "保存失败", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>编辑个人陈述</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">文书标题</Label>
          <Input
            id="title"
            placeholder="例如：Common App 主文书"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="uni">目标大学（可选）</Label>
          <select
            id="uni"
            value={universityId}
            onChange={(e) => setUniversityId(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">不指定</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">文书内容</Label>
          <textarea
            id="content"
            rows={20}
            placeholder="开始撰写你的个人陈述..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y min-h-[300px] font-mono"
          />
          <p className="text-xs text-gray-400 text-right">{content.length} 字符</p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => router.back()}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存文书"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
