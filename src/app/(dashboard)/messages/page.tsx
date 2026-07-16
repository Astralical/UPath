"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/LanguageContext";
import { MessageSquare, Send } from "lucide-react";

const CONVERSATIONS = [
  { id: "1", name: "Zhang Laoshi", nameZh: "张老师", lastMessage: "Remember to finish your essay draft", lastMessageZh: "记得完成文书初稿", time: "10 min ago", timeZh: "10分钟前", unread: 2 },
  { id: "2", name: "Li Laoshi", nameZh: "李老师", lastMessage: "How is your application going?", lastMessageZh: "你的申请进度如何？", time: "1 hr ago", timeZh: "1小时前", unread: 0 },
  { id: "3", name: "Wang Laoshi", nameZh: "王老师", lastMessage: "Your test scores look great", lastMessageZh: "你的考试分数看起来不错", time: "3 hr ago", timeZh: "3小时前", unread: 0 },
];

const CHAT_MSGS: Record<string, { sender: string; content: string; contentZh: string; time: string; isMe: boolean }[]> = {
  "1": [
    { sender: "Zhang Laoshi", content: "Please finish your personal statement draft this week.", contentZh: "请在本周内完成你的个人陈述初稿", time: "10:30", isMe: false },
    { sender: "Me", content: "Okay, I'm working on it.", contentZh: "好的，我正在写", time: "10:32", isMe: true },
    { sender: "Zhang Laoshi", content: "Let me know if you have any questions.", contentZh: "有问题随时问我", time: "10:33", isMe: false },
  ],
  "2": [
    { sender: "Li Laoshi", content: "Have you submitted your UC application yet?", contentZh: "你提交了加州大学的申请吗？", time: "09:15", isMe: false },
    { sender: "Me", content: "Not yet, still working on the essays.", contentZh: "还没有，还在写文书", time: "09:20", isMe: true },
  ],
  "3": [
    { sender: "Wang Laoshi", content: "Your SAT score of 1520 is excellent for your target schools.", contentZh: "你的SAT 1520分对你目标学校来说非常优秀", time: "08:00", isMe: false },
    { sender: "Me", content: "Thank you! I studied really hard for it.", contentZh: "谢谢！我真的很努力准备了", time: "08:05", isMe: true },
    { sender: "Wang Laoshi", content: "Now focus on your personal statement - that's the key.", contentZh: "现在专注于你的个人陈述 - 这是关键", time: "08:06", isMe: false },
  ],
};

export default function MessagesPage() {
  const { t, lang } = useLang();
  const [message, setMessage] = useState("");
  const [activeConv, setActiveConv] = useState("1");
  const [chatMessages, setChatMessages] = useState(CHAT_MSGS["1"]);

  const activeConversation = CONVERSATIONS.find((c) => c.id === activeConv);

  const handleSelectConv = (id: string) => {
    setActiveConv(id);
    setChatMessages(CHAT_MSGS[id] || []);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
    setChatMessages([...chatMessages, { sender: "Me", content: message, contentZh: message, time: timeStr, isMe: true }]);
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("messages.title")}</h1>
        <p className="text-gray-500 mt-1">{t("messages.subtitle")}</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary-600" />{t("messages.conversations")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            {CONVERSATIONS.map((conv) => (
              <div key={conv.id} onClick={() => handleSelectConv(conv.id)} className={"flex items-center gap-3 p-4 border-b cursor-pointer transition-colors " + (activeConv === conv.id ? "bg-primary-50" : "hover:bg-gray-50")}>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">{conv.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><p className="font-medium text-sm">{lang === "zh" ? conv.nameZh : conv.name}</p><span className="text-xs text-gray-400">{lang === "zh" ? conv.timeZh : conv.time}</span></div>
                  <p className="text-xs text-gray-500 truncate">{lang === "zh" ? conv.lastMessageZh : conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">{conv.unread}</span>}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          <CardHeader className="border-b"><CardTitle className="text-base">{activeConversation ? (lang === "zh" ? activeConversation.nameZh : activeConversation.name) : ""}</CardTitle></CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={"flex " + (msg.isMe ? "justify-end" : "justify-start")}>
                <div className={"max-w-[70%] rounded-2xl px-4 py-2 " + (msg.isMe ? "bg-primary-600 text-white rounded-br-md" : "bg-gray-100 text-gray-900 rounded-bl-md")}>
                  {!msg.isMe && <p className="text-xs font-medium text-primary-600 mb-1">{msg.sender}</p>}
                  <p className="text-sm">{lang === "zh" ? msg.contentZh : msg.content}</p>
                  <p className={"text-xs mt-1 " + (msg.isMe ? "text-primary-200" : "text-gray-400")}>{msg.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input placeholder={t("messages.typeMessage")} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
              <Button size="icon" onClick={handleSend}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
