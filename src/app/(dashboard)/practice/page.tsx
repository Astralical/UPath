"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { BookOpen, Clock, Trophy, Brain, ChevronRight, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "SAT", name: "SAT", color: "bg-blue-100 text-blue-800", icon: "📝" },
  { id: "IELTS", name: "IELTS", color: "bg-green-100 text-green-800", icon: "🎯" },
  { id: "TOEFL", name: "TOEFL", color: "bg-purple-100 text-purple-800", icon: "📚" },
  { id: "ACT", name: "ACT", color: "bg-orange-100 text-orange-800", icon: "🎓" },
];

interface Question {
  id: string;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  explanation?: string;
  section?: string;
  difficulty?: string;
}

export default function PracticePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);

  const fetchAttempts = useCallback(async () => {
    const res = await fetch("/api/practice/attempts");
    if (res.ok) setAttempts(await res.json());
  }, []);

  useEffect(() => { fetchAttempts(); }, [fetchAttempts]);

  const startQuiz = async (categoryId: string) => {
    setLoading(true);
    setSelectedCategory(categoryId);
    const res = await fetch(`/api/practice?category=${categoryId}`);
    if (res.ok) {
      const data = await res.json();
      setQuestions(data);
      setCurrentIndex(0);
      setAnswers({});
      setShowResult(false);
    } else {
      toast({ title: "暂无该类别题目", description: "请联系管理员上传题库", variant: "destructive" });
      setSelectedCategory(null);
    }
    setLoading(false);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    if (answers[questionId]) return;
    setAnswers({ ...answers, [questionId]: answer });
  };

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const allAnswered = questions.every((q) => answers[q.id]);

  const submitQuiz = async () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correctCount++;
    });
    const score = Math.round((correctCount / questions.length) * 100);

    await fetch("/api/practice/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: selectedCategory,
        totalQuestions: questions.length,
        correctCount,
        score,
        answers: JSON.stringify(answers),
      }),
    });

    setShowResult(true);
    fetchAttempts();
    toast({ title: `得分: ${score}%`, description: `${correctCount}/${questions.length} 正确`, variant: score >= 80 ? "success" : "default" });
  };

  // Main category selection
  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">考试练习</h1>
          <p className="text-gray-500 mt-1">选择考试类型，开始练习</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Card
              key={cat.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => startQuiz(cat.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{cat.name}</h3>
                <Badge className={cat.color}>开始练习</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Previous Attempts */}
        {attempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                历史成绩
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attempts.slice(0, 10).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{a.categoryId}</span>
                      <span className="text-xs text-gray-500">
                        {a.correctCount}/{a.totalQuestions} 正确
                      </span>
                    </div>
                    <Badge variant={a.score >= 80 ? "success" : a.score >= 60 ? "default" : "destructive"}>
                      {a.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Quiz interface
  if (showResult) {
    const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center py-8">
          <Trophy className={`h-16 w-16 mx-auto mb-4 ${score >= 80 ? "text-yellow-500" : "text-gray-400"}`} />
          <h2 className="text-3xl font-bold mb-2">你的得分: {score}%</h2>
          <p className="text-gray-500">{correctCount} / {questions.length} 题正确</p>
        </div>

        <div className="space-y-3">
          {questions.map((q, i) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <Card key={q.id} className={isCorrect ? "border-green-200" : "border-red-200"}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-2">{i + 1}. {q.questionText}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {["A", "B", "C", "D"].map((opt) => {
                          const key = `option${opt}` as keyof Question;
                          const val = q[key];
                          if (!val) return null;
                          const isUserChoice = userAnswer === opt;
                          const isCorrectAnswer = q.correctAnswer === opt;
                          return (
                            <div
                              key={opt}
                              className={cn("p-2 rounded border", {
                                "border-green-500 bg-green-50": isCorrectAnswer,
                                "border-red-500 bg-red-50": isUserChoice && !isCorrectAnswer,
                                "border-gray-200": !isUserChoice && !isCorrectAnswer,
                              })}
                            >
                              <span className="font-medium">{opt}.</span> {val}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setSelectedCategory(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <Button onClick={() => startQuiz(selectedCategory)}>重新练习</Button>
        </div>
      </div>
    );
  }

  // Question display
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          退出
        </Button>
        <Badge variant="secondary">
          第 {currentIndex + 1} / {questions.length} 题
        </Badge>
        <div className="w-20" />
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {currentQuestion && (
        <Card>
          <CardContent className="p-6">
            {currentQuestion.section && (
              <Badge variant="outline" className="mb-3">{currentQuestion.section}</Badge>
            )}
            <h3 className="text-lg font-medium mb-6">{currentQuestion.questionText}</h3>
            <div className="space-y-3">
              {["A", "B", "C", "D"].map((opt) => {
                const key = `option${opt}` as keyof Question;
                const val = currentQuestion[key];
                if (!val) return null;
                const isSelected = answers[currentQuestion.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(currentQuestion.id, opt)}
                    disabled={!!answers[currentQuestion.id]}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-primary-500 bg-primary-50"
                        : answers[currentQuestion.id]
                          ? "border-gray-200 opacity-50"
                          : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                    )}
                  >
                    <span className="font-semibold mr-2">{opt}.</span>
                    {val}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
        >
          上一题
        </Button>
        {isLast ? (
          <Button onClick={submitQuiz} disabled={!allAnswered}>
            {allAnswered ? "提交答卷" : `还有 ${questions.length - Object.keys(answers).length} 题未答`}
          </Button>
        ) : (
          <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
            下一题
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
