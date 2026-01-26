"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, Target, Trophy, Lock,
  CheckCircle, AlertCircle, FileText, Award, RefreshCw
} from "lucide-react";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number;
  maxAttempts: number;
  questionCount: number;
  isPublished: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  stats?: {
    totalAttempts: number;
    passRate: number;
  };
}

interface UserAttempt {
  examId: string;
  attempts: number;
  bestScore: number | null;
  passed: boolean;
  certificateId: string | null;
}

export default function CourseExamsPage() {
  useSession();
  const params = useParams();
  const courseId = params?.courseId as string;

  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [course, setCourse] = useState<{ title: string } | null>(null);
  const [userAttempts] = useState<{ [key: string]: UserAttempt }>({});

  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchExams = async () => {
    try {
      // Fetch course info
      const courseRes = await fetch(`/api/courses/${courseId}`);
      const courseData = await courseRes.json();
      if (courseData.course) {
        setCourse({ title: courseData.course.title });
      }

      // Fetch exams
      const examsRes = await fetch(`/api/courses/${courseId}/exam`);
      const examsData = await examsRes.json();
      if (examsData.exams) {
        setExams(examsData.exams.filter((e: Exam) => e.isPublished));
      }

      // TODO: Fetch user's attempt data for each exam
      // This would require a separate API endpoint
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const isExamAvailable = (exam: Exam) => {
    const now = new Date();
    if (exam.availableFrom && new Date(exam.availableFrom) > now) return false;
    if (exam.availableUntil && new Date(exam.availableUntil) < now) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-bold">Loading exams...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Course
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">Course Exams</h1>
        {course && <p className="text-muted-foreground mt-1">{course.title}</p>}
      </div>

      {exams.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <FileText size={64} className="mx-auto text-muted-foreground mb-6" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Exams Available</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            There are no published exams for this course yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map(exam => {
            const available = isExamAvailable(exam);
            const userAttempt = userAttempts[exam.id];

            return (
              <div
                key={exam.id}
                className={`bg-card rounded-2xl border p-6 transition-all ${
                  available ? "border-border hover:border-primary/50" : "border-border opacity-75"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{exam.title}</h3>
                      {userAttempt?.passed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                          <Trophy size={12} /> Passed
                        </span>
                      )}
                      {!available && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                          <Lock size={12} /> Not Available
                        </span>
                      )}
                    </div>

                    {exam.description && (
                      <p className="text-sm text-muted-foreground mb-3">{exam.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <FileText size={14} /> {exam.questionCount} questions
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={14} /> {exam.timeLimit} min
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Target size={14} /> {exam.passingScore}% to pass
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <RefreshCw size={14} /> {exam.maxAttempts} attempts
                      </span>
                    </div>

                    {userAttempt && (
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Attempts: {userAttempt.attempts}/{exam.maxAttempts}
                        </span>
                        {userAttempt.bestScore !== null && (
                          <span className={`font-medium ${
                            userAttempt.passed ? "text-green-500" : "text-foreground"
                          }`}>
                            Best: {userAttempt.bestScore.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {userAttempt?.certificateId && (
                      <Link
                        href={`/certificate/${userAttempt.certificateId}`}
                        className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl font-medium hover:bg-green-500/20 flex items-center gap-2 transition-colors"
                      >
                        <Award size={18} /> Certificate
                      </Link>
                    )}
                    {available ? (
                      <Link
                        href={`/courses/${courseId}/exam/${exam.id}`}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 flex items-center gap-2 transition-colors"
                      >
                        {userAttempt?.passed ? (
                          <>
                            <CheckCircle size={18} /> View Results
                          </>
                        ) : userAttempt ? (
                          <>
                            <RefreshCw size={18} /> Retake
                          </>
                        ) : (
                          <>
                            <FileText size={18} /> Start Exam
                          </>
                        )}
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-muted text-muted-foreground rounded-xl font-medium cursor-not-allowed flex items-center gap-2"
                      >
                        <Lock size={18} /> Not Available
                      </button>
                    )}
                  </div>
                </div>

                {/* Availability Notice */}
                {exam.availableFrom && new Date(exam.availableFrom) > new Date() && (
                  <div className="mt-4 p-3 bg-accent/50 rounded-lg text-sm">
                    <AlertCircle size={14} className="inline mr-2 text-yellow-500" />
                    <span className="text-muted-foreground">
                      Available from: {new Date(exam.availableFrom).toLocaleString()}
                    </span>
                  </div>
                )}
                {exam.availableUntil && new Date(exam.availableUntil) < new Date() && (
                  <div className="mt-4 p-3 bg-red-500/10 rounded-lg text-sm">
                    <AlertCircle size={14} className="inline mr-2 text-red-500" />
                    <span className="text-muted-foreground">
                      Exam ended: {new Date(exam.availableUntil).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <div className="mt-8 bg-primary/5 rounded-2xl border border-primary/20 p-6">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <AlertCircle className="text-primary" size={20} /> About Course Exams
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Complete exams to test your knowledge and earn certificates</li>
          <li>• You must pass with the required score to receive a certificate</li>
          <li>• Each exam has a limited number of attempts</li>
          <li>• Certificates are automatically generated upon passing</li>
        </ul>
      </div>
    </div>
  );
}
