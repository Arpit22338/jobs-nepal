"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Code, CheckCircle, Terminal, Cpu, Award, HelpCircle, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";
import { PaymentModal } from "@/components/PaymentModal";

// --- Quiz Data ---
const QUIZ_DATA = [
  {
    id: 1,
    question: "What is the correct file extension for Python files?",
    options: [".pt", ".pyt", ".py", ".python"],
    answer: 2 // Index of correct answer
  },
  {
    id: 2,
    question: "Which operator is used for exponentiation in Python?",
    options: ["^", "**", "//", "exp()"],
    answer: 1
  },
  {
    id: 3,
    question: "How do you create a function in Python?",
    options: ["function myFunction():", "def myFunction():", "create myFunction():", "func myFunction():"],
    answer: 1
  },
  {
    id: 4,
    question: "Which collection is ordered, changeable, and allows duplicate members?",
    options: ["Set", "Dictionary", "Tuple", "List"],
    answer: 3
  },
  {
    id: 5,
    question: "What is the output of: print(10 // 3)?",
    options: ["3.33", "3", "4", "3.0"],
    answer: 1
  }
];

export default function PythonCoursePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"lessons" | "quiz" | "exam" | "certificate">("lessons");
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [examPassed, setExamPassed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Quiz State
  const [answers, setAnswers] = useState<number[]>(new Array(QUIZ_DATA.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  
  // Certificate State
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [signBase64, setSignBase64] = useState<string>("");

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

  const handleQuizSubmit = (answers: number[]) => {
    let score = 0;
    answers.forEach((ans, idx) => {
      if (ans === QUIZ_DATA[idx].answer) score++;
    });
    setQuizScore(score);
    if (score === QUIZ_DATA.length) {
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

  const renderLessons = () => (
    <div className="space-y-12">
      {/* Introduction */}
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Introduction: Why Python?</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Python is one of the most popular and versatile programming languages in the world. 
          Known for its simplicity and readability, it&apos;s the perfect language for beginners. 
          From web development to data science and artificial intelligence, Python is everywhere.
        </p>
      </div>

      {/* Lesson 1: Variables & Data Types */}
      <div className="bg-yellow-50 rounded-xl p-8 border border-yellow-100">
        <div className="flex items-center mb-6">
          <div className="bg-yellow-500 text-white p-2 rounded-lg mr-4">
            <Terminal size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Lesson 1: Variables & Data Types</h3>
        </div>
        <p className="text-gray-700 mb-6">
          Variables are containers for storing data values. Unlike other languages, Python has no command for declaring a variable.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="font-bold text-yellow-800 mb-3">Common Data Types</h4>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1" /> <strong>String (str):</strong> Text, e.g., &quot;Hello&quot;</li>
              <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1" /> <strong>Integer (int):</strong> Whole numbers, e.g., 10</li>
              <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1" /> <strong>Float (float):</strong> Decimals, e.g., 3.14</li>
              <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1" /> <strong>Boolean (bool):</strong> True/False</li>
            </ul>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg shadow-sm text-white font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`x = 5           # int
y = "John"      # str
z = 4.5         # float
active = True   # bool

print(type(x))  # <class 'int'>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Lesson 2: Operators */}
      <div className="bg-purple-50 rounded-xl p-8 border border-purple-100">
        <div className="flex items-center mb-6">
          <div className="bg-purple-600 text-white p-2 rounded-lg mr-4">
            <Code size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Lesson 2: Basic Operators</h3>
        </div>
        <p className="text-gray-700 mb-6">
          Operators are used to perform operations on variables and values.
        </p>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2">Operator</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Example</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b"><td className="py-2 font-mono">+</td><td>Addition</td><td className="font-mono">x + y</td></tr>
              <tr className="border-b"><td className="py-2 font-mono">-</td><td>Subtraction</td><td className="font-mono">x - y</td></tr>
              <tr className="border-b"><td className="py-2 font-mono">*</td><td>Multiplication</td><td className="font-mono">x * y</td></tr>
              <tr className="border-b"><td className="py-2 font-mono">/</td><td>Division</td><td className="font-mono">x / y</td></tr>
              <tr className="border-b"><td className="py-2 font-mono">%</td><td>Modulus (Remainder)</td><td className="font-mono">x % y</td></tr>
              <tr className="border-b"><td className="py-2 font-mono">**</td><td>Exponentiation</td><td className="font-mono">x ** y</td></tr>
              <tr><td className="py-2 font-mono">{'//'}</td><td>Floor Division</td><td className="font-mono">x {'//'} y</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Lesson 3: Control Flow */}
      <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
        <div className="flex items-center mb-6">
          <div className="bg-blue-600 text-white p-2 rounded-lg mr-4">
            <Cpu size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Lesson 3: Control Flow (If/Else)</h3>
        </div>
        <p className="text-gray-700 mb-6">
          Python supports the usual logical conditions from mathematics. These conditions can be used in several ways, most commonly in &quot;if statements&quot; and loops.
        </p>
        <div className="bg-slate-800 p-6 rounded-lg shadow-sm text-white font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`a = 200
b = 33
if b > a:
  print("b is greater than a")
elif a == b:
  print("a and b are equal")
else:
  print("a is greater than b")`}
            </pre>
        </div>
      </div>

      {/* Lesson 4: Functions */}
      <div className="bg-green-50 rounded-xl p-8 border border-green-100">
        <div className="flex items-center mb-6">
          <div className="bg-green-600 text-white p-2 rounded-lg mr-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Lesson 4: Functions</h3>
        </div>
        <p className="text-gray-700 mb-6">
          A function is a block of code which only runs when it is called. You can pass data, known as parameters, into a function.
        </p>
        <div className="bg-slate-800 p-6 rounded-lg shadow-sm text-white font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`def my_function(fname):
  print(fname + " Refsnes")

my_function("Emil")
my_function("Tobias")
my_function("Linus")`}
            </pre>
        </div>
      </div>

      <div className="text-center pt-8">
        <button 
          onClick={() => setActiveTab("quiz")}
          className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg flex items-center mx-auto"
        >
          <HelpCircle className="mr-2" />
          Take the Quiz to Unlock Certificate
        </button>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const checkAnswers = () => {
      handleQuizSubmit(answers);
      setSubmitted(true);
    };

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-6 text-center">Final Exam Quiz</h2>
          <p className="text-gray-600 text-center mb-8">Answer all questions correctly to pass and get your certificate.</p>
          
          <div className="space-y-8">
            {QUIZ_DATA.map((q, qIdx) => (
              <div key={q.id} className="border-b pb-6 last:border-0">
                <p className="font-semibold text-lg mb-4">{qIdx + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[qIdx] === oIdx 
                        ? "bg-blue-50 border-blue-500" 
                        : "hover:bg-gray-50 border-gray-200"
                    } ${
                      submitted && q.answer === oIdx ? "bg-green-100 border-green-500" : ""
                    } ${
                      submitted && answers[qIdx] === oIdx && answers[qIdx] !== q.answer ? "bg-red-100 border-red-500" : ""
                    }`}>
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        className="mr-3"
                        checked={answers[qIdx] === oIdx}
                        onChange={() => {
                          if (!submitted) {
                            const newAnswers = [...answers];
                            newAnswers[qIdx] = oIdx;
                            setAnswers(newAnswers);
                          }
                        }}
                        disabled={submitted}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!submitted && (
            <div className="mt-8 text-center">
              <button 
                onClick={checkAnswers}
                disabled={answers.includes(-1)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answers
              </button>
            </div>
          )}

          {submitted && (
            <div className="mt-8 text-center space-y-4">
              <div className="text-2xl font-bold">
                Score: {quizScore} / {QUIZ_DATA.length}
              </div>
              {quizScore === QUIZ_DATA.length ? (
                <div className="text-green-600">
                  <p className="mb-4">Congratulations! You passed the exam.</p>
                  <button 
                    onClick={() => setActiveTab("certificate")}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 animate-bounce"
                  >
                    Get Certificate
                  </button>
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="mb-4">You need 100% to pass. Please try again.</p>
                  <button 
                    onClick={() => {
                      setAnswers(new Array(QUIZ_DATA.length).fill(-1));
                      setSubmitted(false);
                      setQuizScore(null);
                    }}
                    className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900"
                  >
                    Retry Quiz
                  </button>
                </div>
              )}
            </div>
          )}
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
            <p className="text-xl text-yellow-200 max-w-2xl mx-auto font-light">
              &quot;Unlock the Power of Code&quot;
            </p>
          </div>
        </div>

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
      </div>

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        planName="Basic Python Programming"
        amount={299}
        onSuccess={() => setShowPaymentModal(false)}
      />
    </div>
  );
}
