"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Clock, AlertTriangle, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Flag, Award, BookOpen, Lock,
  RefreshCw, Trophy, Target, FileText
} from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[] | null;
  points: number;
  difficulty: string;
}

interface Attempt {
  id: string;
  attemptNumber: number;
  startedAt: string;
}

interface ExamData {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number;
  maxAttempts: number;
  showResults: boolean;
}

interface ExamResult {
  score: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  passingScore: number;
  timeSpent: number;
  certificateId: string | null;
  showResults: boolean;
  answers?: {
    questionId: string;
    questionText: string;
    userAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string | null;
    pointsEarned: number;
  }[];
}

interface UserStats {
  attempts: number;
  maxAttempts: number;
  bestScore: number | null;
  hasPassed: boolean;
  canRetake: boolean;
  hasActiveAttempt: boolean;
  lastAttempt: any;
}

export default function ExamTakingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const examId = params?.examId as string;

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const handleSubmitRef = useRef<((autoSubmit?: boolean) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchExamInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router, courseId, examId]);

  // Timer effect
  useEffect(() => {
    if (examStarted && timeRemaining > 0 && !result) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            handleSubmitRef.current?.(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [examStarted, result, timeRemaining]);

  // Warn before leaving
  useEffect(() => {
    if (examStarted && !result) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [examStarted, result]);

  const fetchExamInfo = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/exam/${examId}`);
      const data = await response.json();
      
      if (data.exam) {
        setExam(data.exam);
        setUserStats(data.userStats);
      } else {
        alert(data.error || "Failed to load exam");
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
    } finally {
      setLoading(false);
    }
  };

  const startExam = async () => {
    setStarting(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/exam/${examId}/start`, {
        method: "POST"
      });

      const data = await response.json();
      
      if (data.error) {
        if (data.passed) {
          alert("You have already passed this exam!");
          fetchExamInfo();
        } else {
          alert(data.error);
        }
        return;
      }

      setAttempt(data.attempt);
      setQuestions(data.questions);
      setTimeRemaining(data.remainingTime);
      startTimeRef.current = Date.now();
      setExamStarted(true);

      if (data.resuming) {
        alert("Resuming your previous attempt...");
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      alert("Failed to start exam");
    } finally {
      setStarting(false);
    }
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (!attempt || submitting) return;
    
    if (!autoSubmit) {
      const unanswered = questions.filter(q => !answers[q.id]);
      if (unanswered.length > 0) {
        const proceed = confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`);
        if (!proceed) return;
      }
    }

    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const response = await fetch(`/api/courses/${courseId}/exam/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attempt.id,
          answers,
          timeSpent
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.results);
        setExamStarted(false);
      } else {
        alert(data.error || "Failed to submit exam");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to submit exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [attempt, answers, questions, courseId, examId, submitting]);

  // Update the ref whenever handleSubmit changes
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleFlag = (questionId: string) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
    } else {
      newFlagged.add(questionId);
    }
    setFlaggedQuestions(newFlagged);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-bold">Loading exam...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertTriangle size={64} className="mx-auto text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-4">Exam Not Found</h1>
        <Link href={`/courses/${courseId}`} className="text-primary font-bold hover:underline">
          Back to Course
        </Link>
      </div>
    );
  }

  // Show results page
  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className={`rounded-3xl border-2 p-8 text-center ${
          result.passed ? "bg-green-500/5 border-green-500" : "bg-red-500/5 border-red-500"
        }`}>
          {result.passed ? (
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="text-green-500" size={48} />
            </div>
          ) : (
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-500" size={48} />
            </div>
          )}

          <h1 className="text-3xl font-black text-foreground mb-2">
            {result.passed ? "Congratulations! 🎉" : "Keep Trying!"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {result.passed
              ? "You have successfully passed the exam!"
              : `You need ${result.passingScore}% to pass. You can try again!`}
          </p>

          {/* Score Display */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className={`text-3xl font-black ${
                result.passed ? "text-green-500" : "text-red-500"
              }`}>
                {result.score.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Your Score</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-3xl font-black text-foreground">{result.earnedPoints}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-3xl font-black text-foreground">
                {Math.floor(result.timeSpent / 60)}m
              </p>
              <p className="text-xs text-muted-foreground">Time Taken</p>
            </div>
          </div>

          {/* Certificate Link */}
          {result.certificateId && (
            <Link
              href={`/certificate/${result.certificateId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 mb-6 transition-colors"
            >
              <Award size={20} /> View Certificate
            </Link>
          )}

          {/* Detailed Results */}
          {result.showResults && result.answers && (
            <div className="mt-8 text-left">
              <h2 className="text-xl font-bold text-foreground mb-4">Question Review</h2>
              <div className="space-y-4">
                {result.answers.map((ans, index) => (
                  <div
                    key={ans.questionId}
                    className={`bg-card rounded-xl border p-5 ${
                      ans.isCorrect ? "border-green-500/30" : "border-red-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        ans.isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                      }`}>
                        {ans.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-2">
                          {index + 1}. {ans.questionText}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className={ans.isCorrect ? "text-green-500" : "text-red-500"}>
                            Your answer: {ans.userAnswer || "(No answer)"}
                          </p>
                          {!ans.isCorrect && (
                            <p className="text-green-500">
                              Correct answer: {ans.correctAnswer}
                            </p>
                          )}
                        </div>
                        {ans.explanation && (
                          <div className="mt-3 p-3 rounded-lg bg-accent/50 text-sm">
                            <p className="font-medium text-foreground mb-1">Explanation</p>
                            <p className="text-muted-foreground">{ans.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={`/courses/${courseId}`}
              className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-accent transition-colors"
            >
              Back to Course
            </Link>
            {!result.passed && userStats && userStats.attempts < userStats.maxAttempts && (
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setFlaggedQuestions(new Set());
                  fetchExamInfo();
                }}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={20} /> Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show exam taking interface
  if (examStarted && questions.length > 0) {
    const question = questions[currentQuestion];
    const answeredCount = Object.keys(answers).filter(k => answers[k]).length;

    return (
      <div className="min-h-screen bg-background">
        {/* Timer Bar */}
        <div className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-bold text-foreground">{exam.title}</span>
              <span className="text-sm text-muted-foreground">
                {answeredCount}/{questions.length} answered
              </span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${
              timeRemaining < 300 ? "bg-red-500 text-white animate-pulse" : "bg-accent"
            }`}>
              <Clock size={18} />
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        <div className="pt-20 pb-32 max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Question Navigator */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-card rounded-2xl border border-border p-4 sticky top-24">
                <h3 className="font-bold text-foreground mb-3">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(i)}
                      className={`w-full aspect-square rounded-lg text-sm font-bold transition-all ${
                        i === currentQuestion
                          ? "bg-primary text-primary-foreground"
                          : answers[q.id]
                          ? "bg-green-500/20 text-green-500 border border-green-500/50"
                          : flaggedQuestions.has(q.id)
                          ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50"
                          : "bg-accent hover:bg-accent/80"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50" />
                    <span>Flagged</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                      question.difficulty === "EASY" ? "bg-green-500/20 text-green-500" :
                      question.difficulty === "HARD" ? "bg-red-500/20 text-red-500" :
                      "bg-yellow-500/20 text-yellow-500"
                    }`}>
                      {question.difficulty}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFlag(question.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      flaggedQuestions.has(question.id)
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "hover:bg-accent text-muted-foreground"
                    }`}
                    title="Flag for review"
                  >
                    <Flag size={20} />
                  </button>
                </div>

                <p className="text-lg font-medium text-foreground mb-6">
                  {question.questionText}
                </p>

                {/* Multiple Choice Options */}
                {question.questionType === "MULTIPLE_CHOICE" && question.options && (
                  <div className="space-y-3">
                    {question.options.map((opt, i) => {
                      const letter = String.fromCharCode(65 + i);
                      const isSelected = answers[question.id] === letter;
                      return (
                        <button
                          key={i}
                          onClick={() => setAnswers({ ...answers, [question.id]: letter })}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent"
                            }`}>
                              {letter}
                            </span>
                            <span className="text-foreground">{opt.replace(/^[A-D]\.\s*/, "")}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* True/False Options */}
                {question.questionType === "TRUE_FALSE" && (
                  <div className="flex gap-4">
                    {["True", "False"].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAnswers({ ...answers, [question.id]: opt })}
                        className={`flex-1 p-4 rounded-xl border-2 font-bold transition-all ${
                          answers[question.id] === opt
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Short Answer */}
                {question.questionType === "SHORT_ANSWER" && (
                  <input
                    type="text"
                    value={answers[question.id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                    placeholder="Type your answer..."
                  />
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 rounded-lg border border-border font-medium hover:bg-accent disabled:opacity-50 flex items-center gap-2 transition-colors"
                  >
                    <ChevronLeft size={20} /> Previous
                  </button>
                  
                  {currentQuestion === questions.length - 1 ? (
                    <button
                      onClick={() => handleSubmit()}
                      disabled={submitting}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                      Submit Exam
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 flex items-center gap-2 transition-colors"
                    >
                      Next <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {answeredCount === questions.length ? (
                <span className="text-green-500 font-medium">✓ All questions answered</span>
              ) : (
                <span>{questions.length - answeredCount} questions remaining</span>
              )}
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={submitting}
              className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
              Submit Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show exam start page
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Course
      </Link>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-primary/10 p-8 text-center border-b border-border">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-primary" size={40} />
          </div>
          <h1 className="text-2xl font-black text-foreground">{exam.title}</h1>
          {exam.description && (
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">{exam.description}</p>
          )}
        </div>

        {/* Exam Info */}
        <div className="p-8">
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-xl">
              <Clock className="text-primary" size={24} />
              <div>
                <p className="font-bold text-foreground">{exam.timeLimit} minutes</p>
                <p className="text-xs text-muted-foreground">Time Limit</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-xl">
              <Target className="text-primary" size={24} />
              <div>
                <p className="font-bold text-foreground">{exam.passingScore}%</p>
                <p className="text-xs text-muted-foreground">Passing Score</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-xl">
              <RefreshCw className="text-primary" size={24} />
              <div>
                <p className="font-bold text-foreground">
                  {userStats?.attempts || 0} / {exam.maxAttempts}
                </p>
                <p className="text-xs text-muted-foreground">Attempts Used</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-xl">
              <Award className="text-primary" size={24} />
              <div>
                <p className="font-bold text-foreground">
                  {userStats?.bestScore !== null && userStats?.bestScore !== undefined ? `${userStats.bestScore.toFixed(1)}%` : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">Best Score</p>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="mb-8">
            <h3 className="font-bold text-foreground mb-3">Exam Rules</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span>You have {exam.timeLimit} minutes to complete the exam</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span>You need {exam.passingScore}% to pass and earn a certificate</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span>You can attempt this exam up to {exam.maxAttempts} times</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                <span>Don&apos;t refresh or close the page during the exam</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                <span>The exam will auto-submit when time runs out</span>
              </li>
            </ul>
          </div>

          {/* Status Messages */}
          {userStats?.hasPassed && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Trophy className="text-green-500" size={24} />
                <div>
                  <p className="font-bold text-green-500">You&apos;ve Already Passed!</p>
                  <p className="text-sm text-muted-foreground">
                    Your best score: {userStats.bestScore?.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {userStats && userStats.attempts >= exam.maxAttempts && !userStats.hasPassed && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Lock className="text-red-500" size={24} />
                <div>
                  <p className="font-bold text-red-500">Maximum Attempts Reached</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ve used all {exam.maxAttempts} attempts
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Start Button */}
          {userStats?.canRetake || (userStats && userStats.attempts === 0) ? (
            <button
              onClick={startExam}
              disabled={starting}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black text-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-3 transition-colors"
            >
              {starting ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Starting...
                </>
              ) : userStats?.hasActiveAttempt ? (
                <>
                  <RefreshCw size={24} />
                  Resume Exam
                </>
              ) : (
                <>
                  <BookOpen size={24} />
                  {userStats && userStats.attempts > 0 ? "Retake Exam" : "Start Exam"}
                </>
              )}
            </button>
          ) : userStats?.hasPassed ? (
            <Link
              href="/my-certificates"
              className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-center hover:bg-green-600 flex items-center justify-center gap-2 transition-colors"
            >
              <Award size={24} /> View Your Certificate
            </Link>
          ) : (
            <button
              disabled
              className="w-full py-4 bg-muted text-muted-foreground rounded-xl font-bold cursor-not-allowed"
            >
              <Lock size={20} className="inline mr-2" />
              No Attempts Remaining
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
