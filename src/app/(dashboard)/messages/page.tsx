"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";

export default function MessagesPage() {
  const [message, setMessage] = useState("");

  const conversations = [
    { id: "1", name: "张老师", lastMessage: "记得完成文书初稿", time: "10分钟前", unread: 2 },
    { id: "2", name: "李老师", lastMessage: "你的申请进度如何？", time: "1小时前", unread: 0 },
  ];

  const messages = [
    { id: "1", sender: "张老师", content: "你好，请在本周内完成你的个人陈述初稿", time: "10:30", isMe: false },
    { id: "2", sender: "我", content: "好的张老师，我正在写", time: "10:32", isMe: true },
    { id: "3", sender: "张老师", content: "有问题随时问我", time: "10:33", isMe: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">消息中心</h1>
        <p className="text-gray-500 mt-1">与老师和同学沟通交流</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary-600" />
              会话
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center gap-3 p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                  {conv.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{conv.name}</p>
                    <span className="text-xs text-gray-400">{conv.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          <CardHeader className="border-b">
            <CardTitle className="text-base">张老师</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.isMe
                      ? "bg-primary-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                  }`}
                >
                  {!msg.isMe && <p className="text-xs font-medium text-primary-600 mb-1">{msg.sender}</p>}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.isMe ? "text-primary-200" : "text-gray-400"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="输入消息..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setMessage("")}
              />
              <Button size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
