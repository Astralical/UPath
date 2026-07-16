"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizPlayerProps {
  questions: any[];
  categoryId: string;
  setId: string | null;
  setName: string;
  onBack: () => void;
  onComplete: (score: number, correctCount: number, total: number, answers: Record<string,string>) => void;
}

export default function QuizPlayer({ questions, categoryId, setId, setName, onBack, onComplete }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const allAnswered = questions.every((q: any) => answers[q.id]);

  const handleAnswer = (questionId: string, answer: string) => {
    if (answers[questionId]) return;
    setAnswers({ ...answers, [questionId]: answer });
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    let correctCount = 0;
    questions.forEach((q: any) => { if (answers[q.id] === q.correctAnswer) correctCount++; });
    const score = Math.round((correctCount / questions.length) * 100);

    await fetch("/api/practice/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        setId: setId || null,
        totalQuestions: questions.length,
        correctCount,
        score,
        answers: JSON.stringify(answers),
      }),
    });

    setShowResult(true);
    setSubmitting(false);
    onComplete(score, correctCount, questions.length, answers);
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // Results View
  if (showResult) {
    let correctCount = 0;
    questions.forEach((q: any) => { if (answers[q.id] === q.correctAnswer) correctCount++; });
    const score = Math.round((correctCount / questions.length) * 100);
    const emoji = score >= 90 ? "🏆" : score >= 70 ? "👍" : score >= 50 ? "📚" : "💪";

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="text-6xl mb-4">{emoji}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{score}%</h2>
            <p className="text-gray-500 mb-4">{correctCount} of {questions.length} correct</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div className={cn("h-3 rounded-full transition-all", score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500")} style={{ width: `${score}%` }} />
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onBack}>Back to Tests</Button>
              <Button onClick={() => { setShowResult(false); setCurrentIndex(0); setAnswers({}); }}>Retake</Button>
            </div>
          </CardContent>
        </Card>

        {/* Review */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Review Answers</h3>
          {questions.map((q: any, i: number) => {
            const isCorrect = answers[q.id] === q.correctAnswer;
            return (
              <Card key={q.id} className={cn(isCorrect ? "border-green-200" : "border-red-200")}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Q{i+1}: {q.questionText}</p>
                      {q.optionA && <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                        {["A","B","C","D"].map(l => {
                          const opt = q[`option${l}`];
                          if (!opt) return null;
                          const isChosen = answers[q.id] === l;
                          const isRight = q.correctAnswer === l;
                          return <span key={l} className={cn("px-2 py-1 rounded", isRight ? "bg-green-100 text-green-800 font-semibold" : isChosen ? "bg-red-100 text-red-800" : "bg-gray-50 text-gray-600")}>{l}. {opt}</span>;
                        })}
                      </div>}
                      {q.explanation && <p className="text-xs text-gray-500 mt-2 italic">{q.explanation}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Quiz View
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1"/>Exit</Button>
        <div className="text-center">
          <h2 className="font-semibold text-gray-900">{setName}</h2>
          <p className="text-xs text-gray-500">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <Badge variant="outline">{categoryId}</Badge>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {currentQuestion.section && <Badge variant="secondary" className="text-xs">{currentQuestion.section}</Badge>}
              {currentQuestion.difficulty && <Badge variant="outline" className={cn("text-xs", currentQuestion.difficulty === "easy" ? "text-green-600" : currentQuestion.difficulty === "hard" ? "text-red-600" : "text-yellow-600")}>{currentQuestion.difficulty}</Badge>}
            </div>
            <p className="text-gray-900 font-medium mb-6">{currentQuestion.questionText}</p>

            <div className="space-y-3">
              {["A","B","C","D"].map(letter => {
                const optionText = currentQuestion[`option${letter}`];
                if (!optionText) return null;
                const isSelected = answers[currentQuestion.id] === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => handleAnswer(currentQuestion.id, letter)}
                    disabled={!!answers[currentQuestion.id]}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-primary-600 bg-primary-50"
                        : answers[currentQuestion.id]
                          ? "border-gray-200 bg-gray-50 opacity-60"
                          : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                    )}
                  >
                    <span className="font-semibold mr-2">{letter}.</span>
                    {optionText}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>Previous</Button>
        {isLast ? (
          <Button onClick={submitQuiz} disabled={!allAnswered || submitting} className="bg-green-600 hover:bg-green-700">
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!answers[currentQuestion?.id]}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="flex flex-wrap gap-2 justify-center">
        {questions.map((q: any, i: number) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "w-8 h-8 rounded-full text-xs font-medium transition-all",
              i === currentIndex ? "bg-primary-600 text-white" : answers[q.id] ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
