"use client";

import Link from "next/link";
import { 
  ArrowLeft, BookOpen, Code, CheckCircle, Award, HelpCircle, Clock,
  Play, Zap, Terminal, Trophy, ChevronRight, Sparkles, Target,
  Brain, Rocket, GraduationCap
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { PaymentModal } from "@/components/PaymentModal";
import CertificateTemplate from "@/components/CertificateTemplate";
import PythonPlayground from "@/components/PythonPlayground";
import { COURSE_MODULES, FINAL_EXAM_DATA } from "./data";

export default function PythonCoursePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"lessons" | "exam" | "certificate">("lessons");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [examPassed, setExamPassed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<"NONE" | "PENDING" | "APPROVED">("NONE");
  const [loading, setLoading] = useState(true);
  
  // Lesson State
  const [activeModuleId, setActiveModuleId] = useState<string>(COURSE_MODULES[0].id);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [lessonQuizAnswers, setLessonQuizAnswers] = useState<Record<string, number>>({});
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Exam State
  const [answers, setAnswers] = useState<number[]>(new Array(FINAL_EXAM_DATA.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (session) {
      fetch("/api/courses/check-enrollment?title=Basic Python Programming")
        .then(res => res.json())
        .then(data => {
          setEnrollmentStatus(data.status || "NONE");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  const markLessonComplete = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(prev => [...prev, lessonId]);
    }
  };

  const totalLessons = COURSE_MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const progress = Math.round((completedLessons.length / totalLessons) * 100);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const handleQuizSubmit = (answers: number[]) => {
    let score = 0;
    answers.forEach((ans, idx) => {
      if (ans === FINAL_EXAM_DATA[idx].answer) score++;
    });
    setQuizScore(score);
    if (score >= FINAL_EXAM_DATA.length * 0.7) {
      setExamPassed(true);
    }
  };

  const renderLessons = () => {
    const activeModule = COURSE_MODULES.find(m => m.id === activeModuleId) || COURSE_MODULES[0];
    const activeModuleIndex = COURSE_MODULES.findIndex(m => m.id === activeModuleId);
    const activeLesson = activeModule.lessons[activeLessonIndex] || activeModule.lessons[0];
    const nextModule = COURSE_MODULES[activeModuleIndex + 1];
    const prevModule = COURSE_MODULES[activeModuleIndex - 1];
    const isLastLessonInModule = activeLessonIndex === activeModule.lessons.length - 1;
    const isFirstLessonInModule = activeLessonIndex === 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 py-12">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative max-w-7xl mx-auto px-4">
            <Link href="/courses" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft size={20} className="mr-2" /> Back to Classroom
            </Link>
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <Code size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Basic Python Programming</h1>
                <p className="text-white/80 text-lg">Master the fundamentals of Python</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6 max-w-2xl">
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>{completedLessons.length} of {totalLessons} lessons completed</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-80 shrink-0 transition-all hidden lg:block">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-4 sticky top-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-yellow-400" />
                  Course Modules
                </h3>
                <div className="space-y-2">
                  {COURSE_MODULES.map((module, mIdx) => (
                    <div key={module.id}>
                      <button
                        onClick={() => {
                          setActiveModuleId(module.id);
                          setActiveLessonIndex(0);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          activeModuleId === module.id
                            ? 'bg-yellow-500/20 border border-yellow-500/50'
                            : 'hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            activeModuleId === module.id ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {mIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${activeModuleId === module.id ? 'text-yellow-400' : 'text-slate-300'}`}>
                              {module.title.split(':')[1]?.trim() || module.title}
                            </p>
                            <p className="text-xs text-slate-500">{module.lessons.length} lessons • {module.duration}</p>
                          </div>
                        </div>
                      </button>
                      {/* Lessons in module */}
                      {activeModuleId === module.id && (
                        <div className="ml-11 mt-2 space-y-1 border-l-2 border-slate-700 pl-3">
                          {module.lessons.map((lesson, lIdx) => (
                            <button
                              key={lesson.id}
                              onClick={() => setActiveLessonIndex(lIdx)}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
                                activeLessonIndex === lIdx
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                              }`}
                            >
                              {completedLessons.includes(lesson.id) ? (
                                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Take Exam Button */}
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      setActiveTab("exam");
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Trophy size={20} />
                    Take Final Exam
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Current Lesson Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
                {/* Lesson Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 border-b border-slate-600">
                  <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-2">
                    <Zap size={16} />
                    Module {activeModuleIndex + 1} • Lesson {activeLessonIndex + 1}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{activeLesson.title}</h2>
                </div>
                
                {/* Lesson Content */}
                <div className="p-6 md:p-8">
                  <div className="prose prose-invert prose-lg max-w-none">
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="relative rounded-xl overflow-hidden my-6 border border-slate-600">
                              <div className="bg-slate-700 px-4 py-2 flex items-center justify-between border-b border-slate-600">
                                <div className="flex gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                                </div>
                                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                  <Terminal size={12} /> python
                                </span>
                              </div>
                              <pre className="bg-slate-900 p-4 overflow-x-auto m-0">
                                <code className="text-sm font-mono text-emerald-300" {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          ) : (
                            <code className="bg-slate-700 text-yellow-300 px-1.5 py-0.5 rounded font-mono text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                        h3: ({children}) => (
                          <h3 className="text-xl font-bold text-yellow-400 mt-8 mb-4 flex items-center gap-2">
                            <Sparkles size={20} />
                            {children}
                          </h3>
                        ),
                        ul: ({children}) => (
                          <ul className="space-y-2 my-4">{children}</ul>
                        ),
                        li: ({children}) => (
                          <li className="text-slate-300 flex items-start gap-2">
                            <ChevronRight size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                            <span>{children}</span>
                          </li>
                        ),
                        p: ({children}) => (
                          <p className="text-slate-300 leading-relaxed mb-4">{children}</p>
                        ),
                      }}
                    >
                      {activeLesson.content}
                    </ReactMarkdown>
                  </div>

                  {/* Interactive Playground */}
                  {activeLesson.challenge && (
                    <div className="mt-8 bg-slate-900/50 rounded-xl border border-slate-600 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white font-bold">
                          <Play size={18} />
                          Interactive Challenge
                        </div>
                        <span className="text-xs text-emerald-100 bg-white/10 px-2 py-1 rounded-full">
                          Python 3.10
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="bg-slate-800 rounded-lg p-4 mb-4 border border-slate-700">
                          <h4 className="text-sm font-bold text-emerald-400 mb-2">Your Task:</h4>
                          <p className="text-slate-300 text-sm whitespace-pre-wrap">{activeLesson.challenge.description}</p>
                        </div>
                        <PythonPlayground 
                          initialCode={activeLesson.challenge.initialCode}
                          expectedOutput={activeLesson.challenge.expectedOutput}
                          challengeTitle=""
                          challengeDescription=""
                          onSuccess={() => markLessonComplete(activeLesson.id)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Quick Quiz */}
                  {activeLesson.quiz && (
                    <div className="mt-8 bg-slate-900/50 rounded-xl border border-slate-600 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3 flex items-center gap-2">
                        <HelpCircle size={18} className="text-white" />
                        <span className="text-white font-bold">Quick Quiz</span>
                      </div>
                      <div className="p-6">
                        <p className="text-lg font-bold text-white mb-6 flex gap-3">
                          <Brain size={24} className="text-purple-400 flex-shrink-0" />
                          {activeLesson.quiz.question}
                        </p>
                        <div className="space-y-3">
                          {activeLesson.quiz.options.map((opt, idx) => {
                            const isSelected = lessonQuizAnswers[activeLesson.id] === idx;
                            const isCorrect = idx === activeLesson.quiz.answer;
                            
                            let buttonStyle = "bg-slate-800 border-slate-600 text-slate-300 hover:border-purple-500/50 hover:bg-slate-700";
                            if (isSelected) {
                              buttonStyle = isCorrect 
                                ? "bg-green-500/20 border-green-500 text-green-300" 
                                : "bg-red-500/20 border-red-500 text-red-300";
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setLessonQuizAnswers(prev => ({ ...prev, [activeLesson.id]: idx }));
                                  if (idx === activeLesson.quiz.answer) {
                                    markLessonComplete(activeLesson.id);
                                  }
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex justify-between items-center ${buttonStyle}`}
                              >
                                <span className="font-medium">{opt}</span>
                                {isSelected && (
                                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${isCorrect ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                                    {isCorrect ? "✓ Correct" : "✗ Try Again"}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Footer */}
                  <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-700">
                    <button
                      onClick={() => {
                        if (!isFirstLessonInModule) {
                          setActiveLessonIndex(prev => prev - 1);
                        } else if (prevModule) {
                          setActiveModuleId(prevModule.id);
                          setActiveLessonIndex(prevModule.lessons.length - 1);
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={isFirstLessonInModule && !prevModule}
                      className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowLeft size={20} />
                      Previous
                    </button>

                    <button
                      onClick={() => {
                        markLessonComplete(activeLesson.id);
                        if (!isLastLessonInModule) {
                          setActiveLessonIndex(prev => prev + 1);
                        } else if (nextModule) {
                          setActiveModuleId(nextModule.id);
                          setActiveLessonIndex(0);
                        } else {
                          setActiveTab("exam");
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold hover:from-yellow-400 hover:to-amber-400 transition-all"
                    >
                      {isLastLessonInModule && !nextModule ? (
                        <>Take Final Exam <Trophy size={20} /></>
                      ) : (
                        <>Next Lesson <ChevronRight size={20} /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    const currentQuestion = FINAL_EXAM_DATA[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === FINAL_EXAM_DATA.length - 1;

    const handleAnswerSelect = (optionIndex: number) => {
      if (submitted) return;
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = optionIndex;
      setAnswers(newAnswers);
    };

    const handleNextQuestion = () => {
      const selectedAnswer = answers[currentQuestionIndex];
      
      if (selectedAnswer === -1) {
        alert("Please select an answer.");
        return;
      }

      if (selectedAnswer === currentQuestion.answer) {
        if (isLastQuestion) {
          setSubmitted(true);
          setExamPassed(true);
          setQuizScore(FINAL_EXAM_DATA.length);

          fetch("/api/courses/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId: "basic-python" }),
          })
            .then(async (response) => {
              if (response.ok) {
                const data = await response.json();
                console.log("Course completed successfully:", data);
              } else {
                const error = await response.json();
                console.error("Failed to mark completion:", error);
              }
            })
            .catch(err => console.error("Failed to mark completion", err));
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      } else {
        alert("Incorrect answer. Redirecting to the relevant lesson for review.");
        
        const lessonId = currentQuestion.relatedLessonId;
        if (lessonId) {
          const targetModule = COURSE_MODULES.find(m => m.lessons.some(l => l.id === lessonId));
          if (targetModule) {
            const lessonIndex = targetModule.lessons.findIndex(l => l.id === lessonId);
            setActiveModuleId(targetModule.id);
            setActiveLessonIndex(lessonIndex >= 0 ? lessonIndex : 0);
            setActiveTab("lessons");
            const newAnswers = [...answers];
            newAnswers[currentQuestionIndex] = -1;
            setAnswers(newAnswers);
          }
        }
      }
    };

    if (submitted && examPassed) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
          <div className="max-w-3xl mx-auto px-4">
            <Link href="/courses" className="inline-flex items-center text-slate-400 hover:text-yellow-400 mb-8 transition-colors">
              <ArrowLeft size={20} className="mr-2" /> Back to Classroom
            </Link>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Trophy size={48} className="text-slate-900" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">🎉 Congratulations!</h2>
              <p className="text-xl text-slate-400 max-w-md mx-auto mb-8">
                You&apos;ve passed the final exam with a perfect score!
              </p>
              <button 
                onClick={() => setActiveTab("certificate")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 shadow-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Award size={20} />
                Claim Your Certificate
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/courses" className="inline-flex items-center text-slate-400 hover:text-yellow-400 mb-8 transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Back to Classroom
          </Link>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
            {/* Exam Header */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-8 text-center relative">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                  <GraduationCap size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Final Exam</h1>
                <p className="text-purple-200">Prove your Python skills to earn the certificate</p>
              </div>
            </div>

            <div className="p-8">
              {/* Progress */}
              <div className="flex justify-between items-center mb-8">
                <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-bold text-sm border border-purple-500/30">
                  Question {currentQuestionIndex + 1} / {FINAL_EXAM_DATA.length}
                </span>
                <div className="flex-1 mx-4 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-violet-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${((currentQuestionIndex + 1) / FINAL_EXAM_DATA.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-400 font-bold">
                  {Math.round(((currentQuestionIndex + 1) / FINAL_EXAM_DATA.length) * 100)}%
                </span>
              </div>
              
              {/* Question */}
              <div className="mb-10">
                <p className="font-bold text-xl md:text-2xl mb-8 text-white leading-relaxed flex gap-3">
                  <Target size={28} className="text-purple-400 flex-shrink-0 mt-1" />
                  {currentQuestion.question}
                </p>
                <div className="space-y-4">
                  {currentQuestion.options.map((opt, oIdx) => (
                    <label 
                      key={oIdx} 
                      className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all group ${
                        answers[currentQuestionIndex] === oIdx 
                          ? "bg-purple-500/20 border-purple-500" 
                          : "bg-slate-700/50 border-slate-600 hover:border-purple-500/50 hover:bg-slate-700"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                        answers[currentQuestionIndex] === oIdx ? "border-purple-400" : "border-slate-500 group-hover:border-purple-400"
                      }`}>
                        {answers[currentQuestionIndex] === oIdx && <div className="w-3 h-3 rounded-full bg-purple-400" />}
                      </div>
                      <input 
                        type="radio" 
                        name={`q-${currentQuestion.id}`} 
                        className="hidden"
                        checked={answers[currentQuestionIndex] === oIdx}
                        onChange={() => handleAnswerSelect(oIdx)}
                      />
                      <span className="text-lg text-slate-200 font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-700">
                <button
                  onClick={() => {
                    setActiveTab("lessons");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Back to Lessons
                </button>
                <button 
                  onClick={handleNextQuestion}
                  disabled={answers[currentQuestionIndex] === -1}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {isLastQuestion ? "Finish Exam" : "Next Question"}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCertificate = () => (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Link href="/courses" className="inline-flex items-center text-slate-400 hover:text-yellow-400 mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back to Classroom
        </Link>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 md:p-12 text-center">
          <div className="mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              🎉 Course Completed!
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Congratulations! You have successfully mastered the basics of Python programming. 
              Here is your official certificate of completion.
            </p>
          </div>

          <div className="flex justify-center mb-10 overflow-x-auto py-4">
            <CertificateTemplate 
              studentName={session?.user?.name || "Student Name"}
              courseName="Basic Python Programming"
              completionDate={new Date().toISOString()}
              instructorName="RojgaarNepal Team"
              certificateId={`PYTHON-${Date.now()}`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Enrollment Gate */}
      {enrollmentStatus !== "APPROVED" && (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
          <div className="max-w-5xl mx-auto px-4">
            <Link href="/courses" className="inline-flex items-center text-slate-400 hover:text-yellow-400 mb-8 transition-colors">
              <ArrowLeft size={20} className="mr-2" /> Back to Classroom
            </Link>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
              {/* Hero */}
              <div className="relative bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 p-12 md:p-16 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
                    <Code size={48} className="text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Basic Python Programming</h1>
                  <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                    Master the fundamentals of Python with interactive lessons, real-time coding challenges, and a certificate on completion.
                  </p>
                  
                  {!loading && (
                    <div className="flex justify-center">
                      {enrollmentStatus === "PENDING" ? (
                        <button disabled className="bg-white/20 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 cursor-not-allowed border border-white/30">
                          <Clock size={24} /> Enrollment Pending Approval
                        </button>
                      ) : (
                        <button 
                          onClick={() => setShowPaymentModal(true)}
                          className="bg-white text-amber-600 px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 shadow-xl transition-all hover:scale-105 hover:-translate-y-1"
                        >
                          <Rocket size={24} />
                          Enroll Now - Rs. 299
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Features */}
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600 text-center">
                    <div className="w-14 h-14 bg-yellow-500/20 text-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Terminal size={28} />
                    </div>
                    <h3 className="font-bold text-white mb-2">In-Browser Coding</h3>
                    <p className="text-sm text-slate-400">Write and run Python code directly in your browser with instant feedback.</p>
                  </div>
                  <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600 text-center">
                    <div className="w-14 h-14 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Brain size={28} />
                    </div>
                    <h3 className="font-bold text-white mb-2">Interactive Quizzes</h3>
                    <p className="text-sm text-slate-400">Test your knowledge with quizzes after each lesson to reinforce learning.</p>
                  </div>
                  <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600 text-center">
                    <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Award size={28} />
                    </div>
                    <h3 className="font-bold text-white mb-2">Earn Certificate</h3>
                    <p className="text-sm text-slate-400">Complete the course and final exam to earn a verified certificate.</p>
                  </div>
                </div>

                {/* Course Highlights */}
                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center border border-slate-700">
                    <p className="text-3xl font-bold text-yellow-400">{COURSE_MODULES.length}</p>
                    <p className="text-sm text-slate-400">Modules</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center border border-slate-700">
                    <p className="text-3xl font-bold text-green-400">{totalLessons}</p>
                    <p className="text-sm text-slate-400">Lessons</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center border border-slate-700">
                    <p className="text-3xl font-bold text-purple-400">{FINAL_EXAM_DATA.length}</p>
                    <p className="text-sm text-slate-400">Exam Questions</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center border border-slate-700">
                    <p className="text-3xl font-bold text-cyan-400">∞</p>
                    <p className="text-sm text-slate-400">Lifetime Access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Course View */}
      {enrollmentStatus === "APPROVED" && (
        <>
          {activeTab === "lessons" && renderLessons()}
          {activeTab === "exam" && renderQuiz()}
          {activeTab === "certificate" && renderCertificate()}
        </>
      )}

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        planName="Basic Python Programming"
        amount={299}
        onSuccess={() => {
          setShowPaymentModal(false);
          setEnrollmentStatus("PENDING");
        }}
      />
    </>
  );
}
