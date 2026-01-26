"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, ArrowLeft, Loader2, FileText, Download, Copy, Check,
  BookOpen, CheckCircle, AlertCircle, Plus
} from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface GeneratedExam {
  questions: Question[];
  courseSummary: string;
  examDuration: string;
}

export default function ExamGeneratorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null);
  const [copied, setCopied] = useState(false);

  const [examSettings, setExamSettings] = useState({
    questionCount: 10,
    difficulty: "mixed",
    topics: "",
    includeExplanations: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "TEACHER") {
        router.push("/");
        return;
      }
      // Fetch course data
      fetch("/api/teacher/course")
        .then(res => res.json())
        .then(data => {
          if (data.course) {
            setCourse(data.course);
          }
          setLoading(false);
        });
    }
  }, [status, session, router]);

  const generateExam = async () => {
    if (!course) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle: course.title,
          courseContent: course.content || course.description,
          questionCount: examSettings.questionCount,
          difficulty: examSettings.difficulty,
          topics: examSettings.topics.split(",").map((t: string) => t.trim()).filter(Boolean),
          includeExplanations: examSettings.includeExplanations,
        }),
      });

      const data = await response.json();
      if (data.success && data.exam) {
        setGeneratedExam(data.exam);
      } else {
        throw new Error(data.error || "Failed to generate exam");
      }
    } catch (error) {
      console.error("Error generating exam:", error);
      alert("Failed to generate exam. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedExam) return;
    
    let text = `Exam for: ${course.title}\n`;
    text += `Duration: ${generatedExam.examDuration}\n\n`;
    
    generatedExam.questions.forEach((q, i) => {
      text += `${i + 1}. ${q.question}\n`;
      q.options.forEach((opt, j) => {
        const letter = String.fromCharCode(65 + j);
        text += `   ${letter}) ${opt}\n`;
      });
      text += `   Correct Answer: ${String.fromCharCode(65 + q.correctAnswer)}\n`;
      if (q.explanation) {
        text += `   Explanation: ${q.explanation}\n`;
      }
      text += "\n";
    });
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsJson = () => {
    if (!generatedExam) return;
    
    const data = {
      courseTitle: course.title,
      generatedAt: new Date().toISOString(),
      ...generatedExam
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam-${course.title.toLowerCase().replace(/\s+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-bold tracking-tight">Loading...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <BookOpen size={64} className="mx-auto text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-4">No Course Found</h1>
        <p className="text-muted-foreground mb-8">
          You need to create a course before you can generate exams.
        </p>
        <Link
          href="/teacher/course/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} /> Create Course
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/teacher/dashboard"
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <Sparkles className="text-primary" size={32} />
            AI Exam Generator
          </h1>
          <p className="text-muted-foreground">
            Generate exam questions for: <span className="font-medium text-foreground">{course.title}</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 border border-border/50 sticky top-24">
            <h2 className="text-lg font-bold text-foreground mb-4">Exam Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Number of Questions
                </label>
                <select
                  value={examSettings.questionCount}
                  onChange={(e) => setExamSettings({ ...examSettings, questionCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={25}>25 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Difficulty Level
                </label>
                <select
                  value={examSettings.difficulty}
                  onChange={(e) => setExamSettings({ ...examSettings, difficulty: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Focus Topics (Optional)
                </label>
                <input
                  type="text"
                  value={examSettings.topics}
                  onChange={(e) => setExamSettings({ ...examSettings, topics: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50"
                  placeholder="Variables, Loops, Functions..."
                />
                <p className="text-xs text-muted-foreground mt-1">Separate topics with commas</p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={examSettings.includeExplanations}
                  onChange={(e) => setExamSettings({ ...examSettings, includeExplanations: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Include answer explanations</span>
              </label>

              <button
                onClick={generateExam}
                disabled={isGenerating}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Exam
                  </>
                )}
              </button>
            </div>

            {generatedExam && (
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <button
                  onClick={copyToClipboard}
                  className="w-full py-2 border border-border rounded-lg font-medium hover:bg-accent flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
                <button
                  onClick={downloadAsJson}
                  className="w-full py-2 border border-border rounded-lg font-medium hover:bg-accent flex items-center justify-center gap-2 transition-colors"
                >
                  <Download size={18} />
                  Download JSON
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Exam Preview */}
        <div className="lg:col-span-2">
          {!generatedExam ? (
            <div className="glass-card rounded-2xl p-12 border border-border/50 text-center">
              <FileText size={64} className="mx-auto text-muted-foreground mb-6" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Exam Generated Yet</h3>
              <p className="text-muted-foreground mb-6">
                Configure your settings and click &quot;Generate Exam&quot; to create questions based on your course content.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm">
                <Sparkles size={16} />
                AI will analyze your course and generate relevant questions
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Exam Header */}
              <div className="glass-card rounded-xl p-6 border border-primary/30 bg-primary/5">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Generated Exam</h2>
                    <p className="text-muted-foreground">{course.title}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-foreground">{generatedExam.questions.length}</p>
                      <p className="text-muted-foreground">Questions</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-foreground">{generatedExam.examDuration}</p>
                      <p className="text-muted-foreground">Duration</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions */}
              {generatedExam.questions.map((question, qIndex) => (
                <div key={qIndex} className="glass-card rounded-xl p-6 border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      {qIndex + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-4">{question.question}</p>

                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className={`p-3 rounded-lg border ${
                              oIndex === question.correctAnswer
                                ? "border-green-500 bg-green-500/10"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                oIndex === question.correctAnswer
                                  ? "bg-green-500 text-white"
                                  : "bg-accent text-muted-foreground"
                              }`}>
                                {String.fromCharCode(65 + oIndex)}
                              </span>
                              <span className="text-foreground">{option}</span>
                              {oIndex === question.correctAnswer && (
                                <CheckCircle size={18} className="ml-auto text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {question.explanation && examSettings.includeExplanations && (
                        <div className="mt-4 p-4 rounded-lg bg-accent/50 border border-border">
                          <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                            <AlertCircle size={14} className="text-primary" />
                            Explanation
                          </p>
                          <p className="text-sm text-muted-foreground">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Regenerate Button */}
              <div className="text-center pt-4">
                <button
                  onClick={generateExam}
                  disabled={isGenerating}
                  className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-accent flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <Sparkles size={18} />
                  Regenerate Different Questions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
