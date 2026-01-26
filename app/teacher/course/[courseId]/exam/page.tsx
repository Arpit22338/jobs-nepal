"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, ArrowLeft, Loader2, Save, Trash2, Plus, Settings,
  BookOpen, CheckCircle, AlertCircle, BarChart3,
  Edit3, Eye, EyeOff, RefreshCw
} from "lucide-react";

interface Question {
  id?: string;
  questionText: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
  points: number;
}

interface Exam {
  id?: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  isPublished: boolean;
  isActive: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  questions: Question[];
}

export default function ExamManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  
  // AI Generation Settings
  const [aiSettings, setAiSettings] = useState({
    questionCount: 10,
    difficulty: "MIXED" as "EASY" | "MEDIUM" | "HARD" | "MIXED",
    questionTypes: ["MULTIPLE_CHOICE"] as ("MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER")[],
    topics: ""
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchCourseAndExams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router, courseId]);

  const fetchCourseAndExams = async () => {
    try {
      // Fetch course
      const courseRes = await fetch(`/api/courses/${courseId}`);
      const courseData = await courseRes.json();
      if (courseData.course) {
        setCourse(courseData.course);
      }

      // Fetch exams
      const examsRes = await fetch(`/api/courses/${courseId}/exam`);
      const examsData = await examsRes.json();
      if (examsData.exams) {
        setExams(examsData.exams);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewExam = () => {
    setActiveExam({
      title: "New Exam",
      description: "",
      passingScore: 70,
      timeLimit: 60,
      maxAttempts: 3,
      shuffleQuestions: true,
      shuffleOptions: true,
      showResults: true,
      isPublished: false,
      isActive: true,
      availableFrom: null,
      availableUntil: null,
      questions: []
    });
    setShowAiPanel(true);
  };

  const generateWithAI = async () => {
    if (!course || !activeExam) return;
    setGenerating(true);
    
    try {
      const response = await fetch("/api/ai/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: course.title,
          courseDescription: course.description,
          topics: aiSettings.topics.split(",").map(t => t.trim()).filter(Boolean),
          difficulty: aiSettings.difficulty,
          questionCount: aiSettings.questionCount,
          questionTypes: aiSettings.questionTypes
        })
      });

      const data = await response.json();
      if (data.success && data.questions) {
        setActiveExam({
          ...activeExam,
          questions: [...activeExam.questions, ...data.questions.map((q: any) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            tags: q.tags || [],
            points: 1
          }))]
        });
        setShowAiPanel(false);
      } else {
        alert(data.error || "Failed to generate questions");
      }
    } catch (error) {
      console.error("Error generating:", error);
      alert("Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const saveExam = async () => {
    if (!activeExam) return;
    setSaving(true);

    try {
      const method = activeExam.id ? "PUT" : "POST";
      const url = activeExam.id 
        ? `/api/courses/${courseId}/exam/${activeExam.id}`
        : `/api/courses/${courseId}/exam`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeExam)
      });

      const data = await response.json();
      if (data.success) {
        alert("Exam saved successfully!");
        fetchCourseAndExams();
        if (!activeExam.id) {
          setActiveExam({ ...activeExam, id: data.exam.id });
        }
      } else {
        alert(data.error || "Failed to save exam");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save exam");
    } finally {
      setSaving(false);
    }
  };

  const deleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam? This cannot be undone.")) return;

    try {
      const response = await fetch(`/api/courses/${courseId}/exam/${examId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setExams(exams.filter(e => e.id !== examId));
        if (activeExam?.id === examId) {
          setActiveExam(null);
        }
      } else {
        alert("Failed to delete exam");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const addQuestion = () => {
    if (!activeExam) return;
    setActiveExam({
      ...activeExam,
      questions: [...activeExam.questions, {
        questionText: "",
        questionType: "MULTIPLE_CHOICE",
        options: ["A. ", "B. ", "C. ", "D. "],
        correctAnswer: "A",
        explanation: "",
        difficulty: "MEDIUM",
        tags: [],
        points: 1
      }]
    });
    setEditingQuestion(activeExam.questions.length);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    if (!activeExam) return;
    const newQuestions = [...activeExam.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setActiveExam({ ...activeExam, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    if (!activeExam) return;
    setActiveExam({
      ...activeExam,
      questions: activeExam.questions.filter((_, i) => i !== index)
    });
  };

  const regenerateQuestion = async (index: number) => {
    if (!activeExam || !course) return;
    const question = activeExam.questions[index];

    try {
      const response = await fetch("/api/ai/exam", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalQuestion: question,
          courseName: course.title,
          feedback: "Generate a different question on the same topic"
        })
      });

      const data = await response.json();
      if (data.success && data.question) {
        updateQuestion(index, data.question);
      }
    } catch (error) {
      console.error("Error regenerating:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-bold">Loading exam manager...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <BookOpen size={64} className="mx-auto text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h1>
        <Link href="/teacher/dashboard" className="text-primary font-bold hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/teacher/dashboard" className="p-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground">Exam Manager</h1>
            <p className="text-muted-foreground text-sm">{course.title}</p>
          </div>
        </div>
        <button
          onClick={createNewExam}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Create Exam
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Exam List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-4 sticky top-24">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen size={18} /> Course Exams
            </h2>
            
            {exams.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No exams yet. Create your first exam!
              </p>
            ) : (
              <div className="space-y-2">
                {exams.map(exam => (
                  <button
                    key={exam.id}
                    onClick={() => setActiveExam(exam)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      activeExam?.id === exam.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground text-sm truncate">{exam.title}</span>
                      {exam.isPublished ? (
                        <Eye size={14} className="text-green-500" />
                      ) : (
                        <EyeOff size={14} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{(exam as any).questionCount || exam.questions?.length || 0} questions</span>
                      <span>•</span>
                      <span>{exam.timeLimit} min</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-3">
          {!activeExam ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Sparkles size={64} className="mx-auto text-muted-foreground mb-6" />
              <h3 className="text-xl font-bold text-foreground mb-2">Create an Exam</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create exams with AI-generated questions. Students can take exams and earn certificates upon passing.
              </p>
              <button
                onClick={createNewExam}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 inline-flex items-center gap-2 transition-colors"
              >
                <Plus size={20} /> Create New Exam
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Exam Header */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={activeExam.title}
                      onChange={(e) => setActiveExam({ ...activeExam, title: e.target.value })}
                      className="w-full text-xl font-bold bg-transparent border-none focus:outline-none text-foreground"
                      placeholder="Exam Title"
                    />
                    <textarea
                      value={activeExam.description}
                      onChange={(e) => setActiveExam({ ...activeExam, description: e.target.value })}
                      className="w-full mt-2 text-sm bg-transparent border-none focus:outline-none text-muted-foreground resize-none"
                      placeholder="Add a description..."
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                      <Settings size={20} />
                    </button>
                    <button
                      onClick={() => setShowAiPanel(!showAiPanel)}
                      className="px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 flex items-center gap-2 transition-colors"
                    >
                      <Sparkles size={18} /> AI Generate
                    </button>
                    <button
                      onClick={saveExam}
                      disabled={saving}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Save
                    </button>
                    {activeExam.id && (
                      <button
                        onClick={() => deleteExam(activeExam.id!)}
                        className="p-2 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="font-bold text-foreground mb-4">Exam Settings</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Passing Score (%)</label>
                        <input
                          type="number"
                          value={activeExam.passingScore}
                          onChange={(e) => setActiveExam({ ...activeExam, passingScore: parseInt(e.target.value) || 70 })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                          min={0}
                          max={100}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Time Limit (minutes)</label>
                        <input
                          type="number"
                          value={activeExam.timeLimit}
                          onChange={(e) => setActiveExam({ ...activeExam, timeLimit: parseInt(e.target.value) || 60 })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                          min={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Max Attempts</label>
                        <input
                          type="number"
                          value={activeExam.maxAttempts}
                          onChange={(e) => setActiveExam({ ...activeExam, maxAttempts: parseInt(e.target.value) || 3 })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                          min={1}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeExam.shuffleQuestions}
                          onChange={(e) => setActiveExam({ ...activeExam, shuffleQuestions: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">Shuffle Questions</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeExam.shuffleOptions}
                          onChange={(e) => setActiveExam({ ...activeExam, shuffleOptions: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">Shuffle Options</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeExam.showResults}
                          onChange={(e) => setActiveExam({ ...activeExam, showResults: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">Show Results After</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeExam.isPublished}
                          onChange={(e) => setActiveExam({ ...activeExam, isPublished: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-green-600 font-medium">Published</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* AI Generation Panel */}
                {showAiPanel && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Sparkles className="text-primary" size={18} /> AI Question Generator
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Questions</label>
                        <select
                          value={aiSettings.questionCount}
                          onChange={(e) => setAiSettings({ ...aiSettings, questionCount: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        >
                          {[5, 10, 15, 20, 25].map(n => (
                            <option key={n} value={n}>{n} questions</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Difficulty</label>
                        <select
                          value={aiSettings.difficulty}
                          onChange={(e) => setAiSettings({ ...aiSettings, difficulty: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        >
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                          <option value="MIXED">Mixed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Question Types</label>
                        <select
                          value={aiSettings.questionTypes[0]}
                          onChange={(e) => setAiSettings({ ...aiSettings, questionTypes: [e.target.value as any] })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        >
                          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                          <option value="TRUE_FALSE">True/False</option>
                          <option value="SHORT_ANSWER">Short Answer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Topics (optional)</label>
                        <input
                          type="text"
                          value={aiSettings.topics}
                          onChange={(e) => setAiSettings({ ...aiSettings, topics: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                          placeholder="e.g., Variables, Loops"
                        />
                      </div>
                    </div>
                    <button
                      onClick={generateWithAI}
                      disabled={generating}
                      className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Generate Questions
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">
                    Questions ({activeExam.questions.length})
                  </h3>
                  <button
                    onClick={addQuestion}
                    className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent flex items-center gap-2 transition-colors"
                  >
                    <Plus size={18} /> Add Question
                  </button>
                </div>

                {activeExam.questions.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No questions yet. Use AI to generate or add manually.</p>
                  </div>
                ) : (
                  activeExam.questions.map((question, index) => (
                    <div key={index} className="bg-card rounded-xl border border-border p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            question.difficulty === "EASY" ? "bg-green-500/20 text-green-500" :
                            question.difficulty === "HARD" ? "bg-red-500/20 text-red-500" :
                            "bg-yellow-500/20 text-yellow-500"
                          }`}>
                            {question.difficulty}
                          </span>
                        </div>

                        <div className="flex-1">
                          {editingQuestion === index ? (
                            <div className="space-y-4">
                              <textarea
                                value={question.questionText}
                                onChange={(e) => updateQuestion(index, { questionText: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none"
                                rows={2}
                                placeholder="Enter question..."
                              />

                              {question.questionType === "MULTIPLE_CHOICE" && question.options && (
                                <div className="space-y-2">
                                  {question.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        checked={question.correctAnswer === String.fromCharCode(65 + optIndex)}
                                        onChange={() => updateQuestion(index, { correctAnswer: String.fromCharCode(65 + optIndex) })}
                                        className="w-4 h-4"
                                      />
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const newOptions = [...(question.options || [])];
                                          newOptions[optIndex] = e.target.value;
                                          updateQuestion(index, { options: newOptions });
                                        }}
                                        className="flex-1 px-3 py-1 rounded-lg border border-border bg-background text-sm"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {question.questionType === "TRUE_FALSE" && (
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      checked={question.correctAnswer === "True"}
                                      onChange={() => updateQuestion(index, { correctAnswer: "True" })}
                                    />
                                    <span>True</span>
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      checked={question.correctAnswer === "False"}
                                      onChange={() => updateQuestion(index, { correctAnswer: "False" })}
                                    />
                                    <span>False</span>
                                  </label>
                                </div>
                              )}

                              {question.questionType === "SHORT_ANSWER" && (
                                <input
                                  type="text"
                                  value={question.correctAnswer}
                                  onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                  placeholder="Correct answer (use | for multiple acceptable answers)"
                                />
                              )}

                              <textarea
                                value={question.explanation}
                                onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
                                rows={2}
                                placeholder="Explanation (shown after submission)"
                              />

                              <button
                                onClick={() => setEditingQuestion(null)}
                                className="px-4 py-1 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                              >
                                Done
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="font-medium text-foreground mb-3">{question.questionText}</p>

                              {question.questionType === "MULTIPLE_CHOICE" && question.options && (
                                <div className="space-y-2">
                                  {question.options.map((opt, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`p-2 rounded-lg border text-sm ${
                                        question.correctAnswer === String.fromCharCode(65 + optIndex)
                                          ? "border-green-500 bg-green-500/10"
                                          : "border-border"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                          question.correctAnswer === String.fromCharCode(65 + optIndex)
                                            ? "bg-green-500 text-white"
                                            : "bg-accent"
                                        }`}>
                                          {String.fromCharCode(65 + optIndex)}
                                        </span>
                                        <span>{opt.replace(/^[A-D]\.\s*/, "")}</span>
                                        {question.correctAnswer === String.fromCharCode(65 + optIndex) && (
                                          <CheckCircle size={16} className="ml-auto text-green-500" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {question.questionType === "TRUE_FALSE" && (
                                <div className="flex gap-4">
                                  <span className={`px-3 py-1 rounded-full text-sm ${
                                    question.correctAnswer === "True" ? "bg-green-500/20 text-green-500" : "bg-accent"
                                  }`}>
                                    True {question.correctAnswer === "True" && "✓"}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-sm ${
                                    question.correctAnswer === "False" ? "bg-green-500/20 text-green-500" : "bg-accent"
                                  }`}>
                                    False {question.correctAnswer === "False" && "✓"}
                                  </span>
                                </div>
                              )}

                              {question.questionType === "SHORT_ANSWER" && (
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Answer:</span> {question.correctAnswer}
                                </p>
                              )}

                              {question.explanation && (
                                <div className="mt-3 p-3 rounded-lg bg-accent/50 text-sm">
                                  <p className="font-medium text-foreground mb-1">Explanation</p>
                                  <p className="text-muted-foreground">{question.explanation}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setEditingQuestion(editingQuestion === index ? null : index)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => regenerateQuestion(index)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                            title="Regenerate with AI"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => removeQuestion(index)}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Analytics Link (if exam exists) */}
              {activeExam.id && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        <BarChart3 size={20} /> Exam Analytics
                      </h3>
                      <p className="text-sm text-muted-foreground">View detailed statistics about this exam</p>
                    </div>
                    <Link
                      href={`/teacher/course/${courseId}/exam/${activeExam.id}/analytics`}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      View Analytics
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
