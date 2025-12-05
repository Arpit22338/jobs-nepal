"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Code, CheckCircle, Award, HelpCircle, Download, ChevronDown, ChevronUp, PlayCircle, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";
import { PaymentModal } from "@/components/PaymentModal";
import PythonPlayground from "@/components/PythonPlayground";
import { COURSE_MODULES, FINAL_EXAM_DATA } from "./data";
import ReactMarkdown from "react-markdown";

export default function PythonCoursePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"lessons" | "quiz" | "exam" | "certificate">("lessons");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [examPassed, setExamPassed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<"NONE" | "PENDING" | "APPROVED">("NONE");
  const [loading, setLoading] = useState(true);
  
  // Lesson State
  const [expandedModule, setExpandedModule] = useState<string | null>("module-1");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeLessonId, setActiveLessonId] = useState<string>("l1-1");
  const [lessonQuizAnswers, setLessonQuizAnswers] = useState<Record<string, number>>({});

  // Exam State
  const [answers, setAnswers] = useState<number[]>(new Array(FINAL_EXAM_DATA.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Certificate State
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [signBase64, setSignBase64] = useState<string>("");

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

  // Load images for certificate
  useEffect(() => {
    const getBase64FromUrl = async (url: string) => {
      try {
        const data = await fetch(url);
        if (!data.ok) throw new Error(`Failed to fetch ${url}`);
        const blob = await data.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
          };
        });
      } catch (e) {
        console.error("Error loading image:", url, e);
        return "";
      }
    };

    getBase64FromUrl('/logo.png').then((base64) => setLogoBase64(base64 as string));
    getBase64FromUrl('/uploads/ceo-sign.png').then((base64) => setSignBase64(base64 as string));
  }, []);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const handleQuizSubmit = (answers: number[]) => {
    let score = 0;
    answers.forEach((ans, idx) => {
      if (ans === FINAL_EXAM_DATA[idx].answer) score++;
    });
    setQuizScore(score);
    if (score >= FINAL_EXAM_DATA.length * 0.7) { // 70% passing score
      setExamPassed(true);
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'Rojgaar_Python_Basic_Certificate.png';
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Render Components ---

  const renderLessons = () => {
    const activeLesson = COURSE_MODULES
      .flatMap(m => m.lessons)
      .find(l => l.id === activeLessonId);

    return (
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[800px]">
        {/* Sidebar - Curriculum */}
        <div className="w-full lg:w-1/4 bg-white border rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-bold text-gray-900">Course Curriculum</h3>
            <p className="text-xs text-gray-500 mt-1">Select a lesson to start</p>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {COURSE_MODULES.map((module) => (
              <div key={module.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-left text-sm font-medium transition-colors"
                >
                  <span className="truncate font-semibold text-gray-700">{module.title}</span>
                  {expandedModule === module.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expandedModule === module.id && (
                  <div className="bg-white divide-y">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLessonId(lesson.id)}
                        className={`w-full text-left p-3 text-sm flex items-center gap-3 transition-all ${
                          activeLessonId === lesson.id 
                            ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600 pl-2" 
                            : "text-gray-600 hover:bg-gray-50 hover:pl-4 border-l-4 border-transparent"
                        }`}
                      >
                        {lessonQuizAnswers[lesson.id] === lesson.quiz.answer ? (
                          <CheckCircle size={14} className="text-green-500 shrink-0" />
                        ) : (
                          <PlayCircle size={14} className="shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Lesson Content (Left/Top) */}
          <div className="flex-1 overflow-y-auto pr-2 bg-white rounded-xl shadow-sm border p-6">
            {activeLesson ? (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-2">
                    <BookOpen size={16} />
                    <span>Lesson Content</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{activeLesson.title}</h2>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown>{activeLesson.content}</ReactMarkdown>
                  </div>
                </div>

                {/* Quiz Section */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h5 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <HelpCircle size={18} /> Knowledge Check
                  </h5>
                  <p className="text-sm font-medium text-gray-800 mb-4">{activeLesson.quiz.question}</p>
                  <div className="space-y-2">
                    {activeLesson.quiz.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setLessonQuizAnswers(prev => ({ ...prev, [activeLesson.id]: idx }))}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border ${
                          lessonQuizAnswers[activeLesson.id] === idx
                            ? idx === activeLesson.quiz.answer
                              ? "bg-green-100 text-green-800 border-green-200 shadow-sm"
                              : "bg-red-100 text-red-800 border-red-200"
                            : "bg-white hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{opt}</span>
                          {lessonQuizAnswers[activeLesson.id] === idx && (
                            <span className="font-bold text-xs uppercase tracking-wider">
                              {idx === activeLesson.quiz.answer ? "Correct" : "Incorrect"}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p>Select a lesson from the curriculum to start learning</p>
              </div>
            )}
          </div>

          {/* Playground (Right/Bottom) */}
          <div className="w-full lg:w-[45%] h-[500px] lg:h-auto flex flex-col">
             {activeLesson?.challenge ? (
               <div className="h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-800">
                 <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                   <span className="text-gray-300 text-sm font-mono flex items-center gap-2 font-bold">
                     <Code size={16} className="text-blue-400" /> Python Playground
                   </span>
                   <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-700">Pyodide Engine</span>
                 </div>
                 <div className="p-4 bg-gray-800/50 border-b border-gray-700">
                   <p className="text-sm text-gray-300">
                     <span className="text-yellow-400 font-bold uppercase text-xs tracking-wider mr-2">Challenge</span> 
                     {activeLesson.challenge.description}
                   </p>
                 </div>
                 <div className="flex-1 relative">
                   <PythonPlayground 
                     initialCode={activeLesson.challenge.initialCode}
                     expectedOutput={activeLesson.challenge.expectedOutput}
                     onSuccess={() => {
                       // Optional: Mark lesson as complete or show confetti
                     }}
                   />
                 </div>
               </div>
             ) : (
               <div className="h-full bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                 <div className="text-center p-6">
                   <Code size={48} className="mx-auto mb-4 opacity-20" />
                   <p className="font-medium">No coding challenge for this lesson.</p>
                   <p className="text-sm mt-2 opacity-70">Focus on the reading material and quiz.</p>
                 </div>
               </div>
             )}
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
        // Correct
        if (isLastQuestion) {
          setSubmitted(true);
          setExamPassed(true);
          setQuizScore(FINAL_EXAM_DATA.length); // Perfect score if they made it here

          // Call API to mark completion
          fetch("/api/courses/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId: "basic-python" }),
          }).catch(err => console.error("Failed to mark completion", err));
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      } else {
        // Wrong
        alert("Incorrect answer. Redirecting to the relevant lesson for review.");
        
        // Find module for the lesson
        const lessonId = currentQuestion.relatedLessonId;
        if (lessonId) {
          const targetModule = COURSE_MODULES.find(m => m.lessons.some(l => l.id === lessonId));
          if (targetModule) {
            setExpandedModule(targetModule.id);
            setActiveLessonId(lessonId);
            setActiveTab("lessons");
            
            // Reset this question so they can try again later
            const newAnswers = [...answers];
            newAnswers[currentQuestionIndex] = -1;
            setAnswers(newAnswers);
          }
        }
      }
    };

    if (submitted && examPassed) {
       return (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <Award size={40} />
          </div>
          <h2 className="text-3xl font-bold text-green-800">Congratulations!</h2>
          <p className="text-xl text-gray-600">You have passed the final exam with a perfect score.</p>
          <button 
            onClick={() => setActiveTab("certificate")}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg transition-transform hover:scale-105"
          >
            Claim Your Certificate
          </button>
        </div>
       );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Final Exam</h2>
            <span className="text-sm font-medium text-gray-500">
              Question {currentQuestionIndex + 1} of {FINAL_EXAM_DATA.length}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / FINAL_EXAM_DATA.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="mb-8">
            <p className="font-semibold text-xl mb-6">{currentQuestion.question}</p>
            <div className="space-y-3">
              {currentQuestion.options.map((opt, oIdx) => (
                <label 
                  key={oIdx} 
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    answers[currentQuestionIndex] === oIdx 
                      ? "bg-blue-50 border-blue-500 shadow-sm" 
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  <input 
                    type="radio" 
                    name={`q-${currentQuestion.id}`} 
                    className="w-5 h-5 text-blue-600 mr-4"
                    checked={answers[currentQuestionIndex] === oIdx}
                    onChange={() => handleAnswerSelect(oIdx)}
                  />
                  <span className="text-lg">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleNextQuestion}
              disabled={answers[currentQuestionIndex] === -1}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLastQuestion ? "Finish Exam" : "Next Question"}
              {!isLastQuestion && <ArrowLeft className="rotate-180" size={20} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCertificate = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
          <CheckCircle size={32} />
          Course Completed!
        </h2>
        <p className="text-gray-600">Congratulations! You have successfully finished the Basic Python Programming course.</p>
      </div>

      {/* Certificate Preview */}
      <div className="flex justify-center mb-8 overflow-auto">
        <div 
          ref={certificateRef}
          className="min-w-[800px] w-[800px] min-h-[600px] h-[600px] p-8 relative text-center flex flex-col items-center justify-center shadow-2xl"
          style={{ 
            fontFamily: 'serif',
            backgroundColor: '#ffffff',
            border: '20px double #1e3a8a',
            color: '#111827'
          }}
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            {logoBase64 && <Image src={logoBase64} alt="Watermark" width={500} height={500} className="w-[500px] h-[500px] object-contain" unoptimized />}
          </div>

          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="mb-1">
                {logoBase64 && <Image src={logoBase64} alt="Rojgaar Logo" width={200} height={64} className="h-12 w-auto object-contain" unoptimized />}
            </div>
            
            <div className="mb-1 font-bold tracking-widest uppercase text-xs" style={{ color: '#1e3a8a' }}>RojgaarNepal Skills Academy</div>
            <h1 className="text-3xl font-bold mb-3 font-serif" style={{ color: '#1e3a8a' }}>Certificate of Completion</h1>
            
            <p className="text-base mb-3 italic" style={{ color: '#4b5563' }}>This is to certify that</p>
            
            <div className="text-2xl font-bold mb-2 border-b-2 inline-block px-10 py-1 min-w-[300px]" style={{ color: '#111827', borderColor: '#d1d5db' }}>
              {session?.user?.name || "Student Name"}
            </div>
            
            <p className="text-base mt-3 mb-3 italic" style={{ color: '#4b5563' }}>
              has successfully completed the comprehensive course on
            </p>
            
            <h2 className="text-xl font-bold mb-6" style={{ color: '#1e40af' }}>Basic Python Programming</h2>
            
            <div className="flex justify-between items-end w-full px-8 mt-4">
              <div className="text-center flex flex-col items-center">
                <div className="text-base font-bold border-b px-4 pb-1 mb-1 min-w-[120px]" style={{ color: '#1f2937', borderColor: '#9ca3af' }}>
                  {new Date().toLocaleDateString()}
                </div>
                <div className="text-xs" style={{ color: '#6b7280' }}>Date</div>
              </div>

              <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 mb-2" style={{ backgroundColor: '#eab308', borderColor: '#ca8a04' }}>
                    <Award size={32} />
                  </div>
              </div>
              
              <div className="text-center flex flex-col items-center relative">
                <div className="absolute bottom-[10px] left-1/2 transform -translate-x-1/2 z-10">
                  {signBase64 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={signBase64} alt="Signature" style={{ height: '150px', width: 'auto', maxWidth: 'none' }} />
                  ) : (
                      <div className="text-9xl font-script font-cursive" style={{ fontFamily: 'cursive', color: '#1e3a8a' }}>Arpit</div>
                    )}
                </div>
                
                <div className="text-base font-bold border-t pt-2 px-8 min-w-[200px] mt-8 relative z-0" style={{ color: '#1f2937', borderColor: '#9ca3af' }}>
                  Arpit Kafle
                </div>
                <div className="text-xs mt-1" style={{ color: '#6b7280' }}>CEO, RojgaarNepal</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={downloadCertificate}
          disabled={isGenerating}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md disabled:opacity-70"
        >
          {isGenerating ? (
            <span className="flex items-center">Generating...</span>
          ) : (
            <>
              <Download size={20} className="mr-2" />
              Download Certificate (PNG)
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/courses" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Classroom
        </Link>
        
        {/* Payment Trigger for Demo/Testing - In real app, this would be gated */}
        <button 
          onClick={() => setShowPaymentModal(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          Buy Course (Rs. 299)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-slate-900 text-white p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/chalkboard.png')]"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-yellow-500 rounded-full mb-4">
              <Code size={32} className="text-slate-900" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">Basic Python Programming</h1>
            <p className="text-xl text-yellow-200 max-w-2xl mx-auto font-light mb-6">
              &quot;Unlock the Power of Code&quot;
            </p>
            
            {!loading && (
              <div className="flex justify-center">
                {enrollmentStatus === "APPROVED" ? (
                  <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
                    <CheckCircle size={24} /> Enter Course
                  </button>
                ) : enrollmentStatus === "PENDING" ? (
                  <button disabled className="bg-gray-500 text-white px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 cursor-not-allowed">
                    <HelpCircle size={24} /> Enrollment Pending
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                  >
                    Enroll Now - Rs. 299
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Section - Only visible if Approved */}
        {enrollmentStatus === "APPROVED" ? (
          <>
            {/* Navigation Tabs */}
            <div className="flex border-b bg-gray-50">
              <button 
                onClick={() => setActiveTab("lessons")}
                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === "lessons" ? "bg-white border-t-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                <BookOpen className="inline-block mr-2 mb-1" size={18} /> Lessons
              </button>
              <button 
                onClick={() => setActiveTab("quiz")}
                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === "quiz" ? "bg-white border-t-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                <HelpCircle className="inline-block mr-2 mb-1" size={18} /> Quiz & Exam
              </button>
              <button 
                onClick={() => examPassed ? setActiveTab("certificate") : alert("You must pass the exam first!")}
                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === "certificate" ? "bg-white border-t-2 border-blue-600 text-blue-600" : "text-gray-400 cursor-not-allowed"}`}
              >
                <Award className="inline-block mr-2 mb-1" size={18} /> Certificate {examPassed ? "" : "(Locked)"}
              </button>
            </div>

            <div className="p-8 md:p-12">
              {activeTab === "lessons" && renderLessons()}
              {activeTab === "quiz" && renderQuiz()}
              {activeTab === "certificate" && renderCertificate()}
            </div>
          </>
        ) : (
          <div className="p-12 text-center bg-gray-50">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Content Locked</h2>
              <p className="text-gray-600 mb-6">
                {enrollmentStatus === "PENDING" 
                  ? "Your enrollment is currently under review. You will be notified once approved."
                  : "Enroll in this course to access lessons, quizzes, and earn a certificate."}
              </p>
              {enrollmentStatus === "NONE" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-8">
                  <div className="p-4 border rounded-lg">
                    <div className="font-bold text-gray-900 mb-1">10+ Lessons</div>
                    <div className="text-sm text-gray-500">Comprehensive Python curriculum</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-bold text-gray-900 mb-1">Interactive Quiz</div>
                    <div className="text-sm text-gray-500">Test your knowledge</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-bold text-gray-900 mb-1">Certificate</div>
                    <div className="text-sm text-gray-500">Verified credential upon completion</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
}
