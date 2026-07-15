"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import {
  FolderOpen,
  File,
  Upload,
  Plus,
  FolderPlus,
  Download,
  Trash2,
  FileText,
  ImageIcon,
  FileArchive,
  ChevronLeft,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-blue-500" />;
  if (mimeType.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
  if (mimeType.includes("zip") || mimeType.includes("rar")) return <FileArchive className="h-8 w-8 text-yellow-500" />;
  return <File className="h-8 w-8 text-gray-400" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DrivePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    const params = currentFolder ? `?folderId=${currentFolder}` : "";
    const [filesRes, foldersRes] = await Promise.all([
      fetch(`/api/drive/files${params}`),
      fetch(`/api/drive/folders${currentFolder ? `?parentId=${currentFolder}` : ""}`),
    ]);
    if (filesRes.ok) setFiles(await filesRes.json());
    if (foldersRes.ok) setFolders(await foldersRes.json());
  }, [currentFolder]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (currentFolder) formData.append("folderId", currentFolder);

    const res = await fetch("/api/drive/upload", { method: "POST", body: formData });
    if (res.ok) {
      toast({ title: "上传成功", variant: "success" });
      fetchData();
    } else {
      toast({ title: "上传失败", variant: "destructive" });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const res = await fetch("/api/drive/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName, parentId: currentFolder }),
    });
    if (res.ok) {
      toast({ title: "文件夹已创建", variant: "success" });
      setNewFolderName("");
      setShowNewFolder(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string, type: "file" | "folder") => {
    const endpoint = type === "file" ? `/api/drive/files?id=${id}` : `/api/drive/folders?id=${id}`;
    await fetch(endpoint, { method: "DELETE" });
    toast({ title: "已删除" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文件管理</h1>
          <p className="text-gray-500 mt-1">管理你的申请文件和资料</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewFolder(!showNewFolder)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            新建文件夹
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "上传中..." : "上传文件"}
          </Button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {/* New Folder Input */}
      {showNewFolder && (
        <Card>
          <CardContent className="p-4 flex gap-2">
            <Input
              placeholder="文件夹名称"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <Button onClick={handleCreateFolder}>创建</Button>
            <Button variant="ghost" onClick={() => setShowNewFolder(false)}>取消</Button>
          </CardContent>
        </Card>
      )}

      {/* Breadcrumb */}
      {currentFolder && (
        <button
          onClick={() => setCurrentFolder(null)}
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
        >
          <ChevronLeft className="h-4 w-4" />
          返回上级目录
        </button>
      )}

      {/* Folders */}
      {folders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">文件夹</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="group p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm cursor-pointer transition-all"
                onDoubleClick={() => setCurrentFolder(folder.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <FolderOpen className="h-8 w-8 text-yellow-500" />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(folder.id, "folder"); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm font-medium truncate">{folder.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">文件</h3>
        {files.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无文件，点击上方按钮上传</p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b">
              <div className="col-span-5">名称</div>
              <div className="col-span-2">大小</div>
              <div className="col-span-3">修改日期</div>
              <div className="col-span-2">操作</div>
            </div>
            {files.map((file) => (
              <div key={file.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 items-center hover:bg-gray-50">
                <div className="col-span-5 flex items-center gap-3">
                  {getFileIcon(file.mimeType)}
                  <span className="text-sm font-medium truncate">{file.originalName}</span>
                </div>
                <div className="col-span-2 text-sm text-gray-500">{formatSize(file.size)}</div>
                <div className="col-span-3 text-sm text-gray-500">{formatDate(file.updatedAt)}</div>
                <div className="col-span-2 flex gap-2">
                  <a
                    href={`/api/drive/download?id=${file.id}`}
                    className="text-primary-600 hover:text-primary-700"
                    title="下载"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.id, "file")}
                    className="text-gray-400 hover:text-red-500"
                    title="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
