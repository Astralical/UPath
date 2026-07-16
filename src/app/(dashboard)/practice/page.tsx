"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { BookOpen, Clock, Trophy, Brain, ChevronRight, ArrowLeft, CheckCircle, XCircle, History, Layers, Target } from "lucide-react";
import { cn } from "@/lib/utils";

// Lazy-load heavy quiz component
const QuizPlayer = dynamic(() => import("./QuizPlayer"), { ssr: false, loading: () => <Card><CardContent className="py-12 text-center text-gray-500">Loading quiz...</CardContent></Card> });

const CATEGORIES = [
  { id: "SAT", name: "SAT", color: "bg-blue-100 text-blue-800", icon: BookOpen },
  { id: "IELTS", name: "IELTS", color: "bg-green-100 text-green-800", icon: BookOpen },
  { id: "TOEFL", name: "TOEFL", color: "bg-purple-100 text-purple-800", icon: BookOpen },
  { id: "ACT", name: "ACT", color: "bg-orange-100 text-orange-800", icon: BookOpen },
];

export default function PracticePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [view, setView] = useState<"categories" | "sets" | "quiz" | "history">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [selectedSetName, setSelectedSetName] = useState<string>("");
  const [testSets, setTestSets] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>(CATEGORIES);

  const fetchAttempts = useCallback(async () => {
    const res = await fetch("/api/practice/attempts");
    if (res.ok) setAttempts(await res.json());
  }, []);

  useEffect(() => { fetchAttempts(); }, [fetchAttempts]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch("/api/practice")
        .then(r => r.ok ? r.json() : [])
        .then(data => { if (Array.isArray(data) && data.length > 0) setCategories(data.map((c: any) => { const cfg = CATEGORIES.find(x => x.id === c.name); return { id: c.name, name: c.name, color: cfg?.color || "bg-gray-100 text-gray-800", icon: cfg?.icon || BookOpen, setCount: c._count?.sets || 0 }; })); });
    }
  }, [status]);

  if (status === "loading") {
    return <div className="space-y-6"><div className="animate-pulse"><div className="h-8 w-48 bg-gray-200 rounded mb-2"/><div className="h-4 w-64 bg-gray-200 rounded"/></div><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_,i)=><div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"/>)}</div></div>;
  }
  if (status === "unauthenticated") return null;

  const loadSets = async (categoryId: string) => {
    setLoading(true);
    setSelectedCategory(categoryId);
    const res = await fetch(`/api/practice?category=${categoryId}&sets=true`);
    if (res.ok) { setTestSets(await res.json()); setView("sets"); }
    else toast({ title: "No test sets found", variant: "destructive" });
    setLoading(false);
  };

  const startSet = async (setId: string, setName: string) => {
    setLoading(true);
    setSelectedSetId(setId);
    setSelectedSetName(setName);
    const cat = selectedCategory || "SAT";
    const res = await fetch(`/api/practice?category=${cat}&setId=${setId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.length === 0) { toast({ title: "No questions in this set", variant: "destructive" }); setLoading(false); return; }
      setQuestions(data);
      setView("quiz");
    }
    setLoading(false);
  };

  const startQuickQuiz = async (categoryId: string) => {
    setLoading(true);
    setSelectedCategory(categoryId);
    setSelectedSetId("");
    setSelectedSetName("Quick Practice");
    const res = await fetch(`/api/practice?category=${categoryId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.length === 0) { toast({ title: "No questions available", description: "Please contact admin", variant: "destructive" }); setLoading(false); return; }
      setQuestions(data);
      setView("quiz");
    }
    setLoading(false);
  };

  const onQuizComplete = (score: number, correctCount: number, total: number, answers: Record<string,string>) => {
    fetchAttempts();
    toast({
      title: `Score: ${score}%`,
      description: `${correctCount}/${total} correct`,
      variant: score >= 80 ? "success" : "default",
    });
  };

  // === CATEGORIES VIEW ===
  if (view === "categories") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Practice</h1>
          <p className="text-gray-500 mt-1">Select a test type to start practicing</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => loadSets(cat.id)}>
              <CardContent className="p-6 text-center">
                <cat.icon className="w-12 h-12 mx-auto text-primary-600 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mt-3">{cat.name}</h3>
                <p className="text-xs text-gray-500">{cat.setCount} test sets</p>
                <Badge className={cat.color + " mt-2"}>View Sets</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary-600"/> Quick Practice</CardTitle><CardDescription>Jump into random questions without selecting a specific set</CardDescription></CardHeader>
          <CardContent><div className="flex gap-3 flex-wrap">{categories.map(c => (<Button key={c.id} variant="outline" onClick={() => startQuickQuiz(c.id)}>{c.name} Quick Start</Button>))}</div></CardContent>
        </Card>

        {/* History */}
        {attempts.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500"/> Test History</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setView("history")}>View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attempts.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <span className="text-sm font-medium">{a.testSet?.name || a.categoryId}</span>
                      <span className="text-xs text-gray-500 ml-3">{a.correctCount}/{a.totalQuestions} correct</span>
                    </div>
                    <Badge className={a.score >= 80 ? "bg-green-100 text-green-800" : a.score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>{a.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // === SETS VIEW ===
  if (view === "sets") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView("categories")}><ArrowLeft className="h-4 w-4 mr-1"/>Back</Button>
          <h1 className="text-2xl font-bold text-gray-900">{selectedCategory} Test Sets</h1>
        </div>
        {loading ? <div className="grid gap-4">{Array(3).fill(0).map((_,i)=><div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"/>)}</div> : testSets.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-500">No test sets found for {selectedCategory}. Try Quick Start instead.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {testSets.map((ts: any) => (
              <Card key={ts.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => startSet(ts.id, ts.name)}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"><Layers className="h-5 w-5 text-primary-600"/></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{ts.name}</h3>
                      <p className="text-sm text-gray-500">{ts.description || `${ts._count?.questions || 0} questions`} &middot; {ts._count?.questions || 0} questions</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // === HISTORY VIEW ===
  if (view === "history") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView("categories")}><ArrowLeft className="h-4 w-4 mr-1"/>Back</Button>
          <h1 className="text-2xl font-bold text-gray-900">Test History</h1>
        </div>
        {attempts.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-500"><History className="h-12 w-12 mx-auto mb-3 text-gray-300"/>No test attempts yet. Start practicing!</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {attempts.map((a: any) => (
              <Card key={a.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{a.testSet?.name || a.categoryId}</p>
                    <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" })} &middot; {a.totalQuestions} questions</p>
                  </div>
                  <div className="text-right">
                    <Badge className={a.score >= 80 ? "bg-green-100 text-green-800" : a.score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>{a.score}%</Badge>
                    <p className="text-xs text-gray-500 mt-1">{a.correctCount}/{a.totalQuestions} correct</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // === QUIZ VIEW (lazy loaded) ===
  return (
    <QuizPlayer
      questions={questions}
      categoryId={selectedCategory || "SAT"}
      setId={selectedSetId}
      setName={selectedSetName}
      onBack={() => setView(selectedSetId ? "sets" : "categories")}
      onComplete={onQuizComplete}
    />
  );
}
