"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, Trophy, Clock, BarChart3,
  AlertTriangle, CheckCircle,
  XCircle, HelpCircle, Target, Award
} from "lucide-react";

interface Analytics {
  examTitle: string;
  passingScore: number;
  maxAttempts: number;
  timeLimit: number;
  questionCount: number;
  overallStats: {
    totalAttempts: number;
    uniqueStudents: number;
    passedCount: number;
    failedCount: number;
    passRate: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    averageTimeMinutes: number;
  };
  scoreDistribution: { range: string; count: number }[];
  questionAnalytics: {
    id: string;
    questionText: string;
    questionType: string;
    difficulty: string;
    totalAnswered: number;
    correctCount: number;
    incorrectCount: number;
    correctRate: number;
    optionDistribution: { [key: string]: number };
    flag: string | null;
  }[];
  recentAttempts: {
    id: string;
    user: { id: string; name: string | null; email: string; image: string | null };
    attemptNumber: number;
    score: number | null;
    passed: boolean | null;
    timeSpent: number | null;
    submittedAt: string | null;
  }[];
  strugglingStudents: {
    userId: string;
    userName: string | null;
    email: string;
    attempts: number;
    bestScore: number;
  }[];
  attemptsByDay: { date: string; count: number }[];
}

export default function ExamAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const examId = params?.examId as string;

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "students">("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router, courseId, examId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/exam/${examId}/analytics`);
      const data = await response.json();
      if (data.examTitle) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-bold">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertTriangle size={64} className="mx-auto text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-4">Analytics Not Available</h1>
        <Link href={`/teacher/course/${courseId}/exam`} className="text-primary font-bold hover:underline">
          Back to Exam Manager
        </Link>
      </div>
    );
  }

  const stats = analytics.overallStats;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/teacher/course/${courseId}/exam`}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground">{analytics.examTitle}</h1>
          <p className="text-muted-foreground text-sm">Exam Analytics & Performance</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stats.uniqueStudents}</p>
              <p className="text-xs text-muted-foreground">Students Attempted</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Trophy className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stats.passRate}%</p>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Target className="text-yellow-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stats.averageScore}%</p>
              <p className="text-xs text-muted-foreground">Average Score</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Clock className="text-purple-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stats.averageTimeMinutes}m</p>
              <p className="text-xs text-muted-foreground">Avg. Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === "overview"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <BarChart3 size={16} className="inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === "questions"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <HelpCircle size={16} className="inline mr-2" />
          Questions
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === "students"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Users size={16} className="inline mr-2" />
          Students
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-bold text-foreground mb-4">Score Distribution</h3>
            <div className="space-y-3">
              {analytics.scoreDistribution.map((bucket, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-16">{bucket.range}</span>
                  <div className="flex-1 h-6 bg-accent rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        i >= 7 ? "bg-green-500" : i >= 4 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{
                        width: `${stats.totalAttempts > 0 ? (bucket.count / stats.totalAttempts) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-8">{bucket.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-bold text-foreground mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Total Attempts</span>
                <span className="font-bold text-foreground">{stats.totalAttempts}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Passed</span>
                <span className="font-bold text-green-500">{stats.passedCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Failed</span>
                <span className="font-bold text-red-500">{stats.failedCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Highest Score</span>
                <span className="font-bold text-foreground">{stats.highestScore}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Lowest Score</span>
                <span className="font-bold text-foreground">{stats.lowestScore}%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Passing Score</span>
                <span className="font-bold text-foreground">{analytics.passingScore}%</span>
              </div>
            </div>
          </div>

          {/* Recent Attempts */}
          <div className="bg-card rounded-2xl border border-border p-6 lg:col-span-2">
            <h3 className="font-bold text-foreground mb-4">Recent Attempts</h3>
            {analytics.recentAttempts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No attempts yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border">
                      <th className="pb-3 font-medium">Student</th>
                      <th className="pb-3 font-medium">Attempt</th>
                      <th className="pb-3 font-medium">Score</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Time</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {analytics.recentAttempts.map(attempt => (
                      <tr key={attempt.id}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {attempt.user.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{attempt.user.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{attempt.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-foreground">#{attempt.attemptNumber}</td>
                        <td className="py-3">
                          <span className={`font-bold ${
                            (attempt.score || 0) >= analytics.passingScore ? "text-green-500" : "text-red-500"
                          }`}>
                            {attempt.score?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3">
                          {attempt.passed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                              <CheckCircle size={12} /> Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-xs font-medium">
                              <XCircle size={12} /> Failed
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {attempt.timeSpent ? formatTime(attempt.timeSpent) : "-"}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {analytics.questionAnalytics.map((q, index) => (
            <div key={q.id} className={`bg-card rounded-xl border p-5 ${
              q.flag ? (q.flag === "TOO_EASY" ? "border-yellow-500/50" : "border-red-500/50") : "border-border"
            }`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground mb-2">{q.questionText}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full ${
                      q.difficulty === "EASY" ? "bg-green-500/20 text-green-500" :
                      q.difficulty === "HARD" ? "bg-red-500/20 text-red-500" :
                      "bg-yellow-500/20 text-yellow-500"
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-muted-foreground">{q.questionType}</span>
                    <span className="text-muted-foreground">{q.totalAnswered} answers</span>
                  </div>
                  
                  {q.flag && (
                    <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      q.flag === "TOO_EASY" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"
                    }`}>
                      <AlertTriangle size={12} />
                      {q.flag === "TOO_EASY" ? "This question might be too easy" : "This question might be too hard"}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${
                    q.correctRate >= 70 ? "text-green-500" : q.correctRate >= 40 ? "text-yellow-500" : "text-red-500"
                  }`}>
                    {q.correctRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">correct</p>
                </div>
              </div>

              {/* Correct vs Incorrect Bar */}
              <div className="mt-4 h-3 bg-accent rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${q.correctRate}%` }}
                />
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${100 - q.correctRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{q.correctCount} correct</span>
                <span>{q.incorrectCount} incorrect</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="space-y-6">
          {/* Struggling Students */}
          {analytics.strugglingStudents.length > 0 && (
            <div className="bg-card rounded-2xl border border-red-500/30 p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Students Who May Need Help
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                These students have attempted the exam multiple times but haven&apos;t passed yet.
              </p>
              <div className="space-y-3">
                {analytics.strugglingStudents.map(student => (
                  <div key={student.userId} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-sm font-bold text-red-500">
                        {student.userName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{student.userName || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{student.attempts} attempts</p>
                      <p className="text-xs text-muted-foreground">Best: {student.bestScore.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Students Performance */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-bold text-foreground mb-4">All Student Attempts</h3>
            {analytics.recentAttempts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No attempts yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.recentAttempts.map(attempt => (
                  <div key={attempt.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        attempt.passed ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {attempt.user.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{attempt.user.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">Attempt #{attempt.attemptNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className={`text-lg font-bold ${
                          attempt.passed ? "text-green-500" : "text-red-500"
                        }`}>
                          {attempt.score?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">
                          {attempt.timeSpent ? Math.floor(attempt.timeSpent / 60) : "-"}m
                        </p>
                        <p className="text-xs text-muted-foreground">Time</p>
                      </div>
                      {attempt.passed ? (
                        <Award className="text-green-500" size={24} />
                      ) : (
                        <XCircle className="text-red-500" size={24} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
