"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Code, CheckCircle, Terminal, Cpu, GraduationCap, Download, Award } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";

export default function PythonCoursePage() {
  const { data: session } = useSession();
  const [showCertificate, setShowCertificate] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [signBase64, setSignBase64] = useState<string>("");

  useEffect(() => {
    // Convert logo to base64 to avoid CORS issues in html2canvas
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

    getBase64FromUrl('/logo.png').then((base64) => {
      setLogoBase64(base64 as string);
    });

    getBase64FromUrl('/uploads/ceo-sign.png').then((base64) => {
      setSignBase64(base64 as string);
    });
  }, []);

  const handleComplete = () => {
    setShowCertificate(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    setIsGenerating(true);
    try {
      // Small delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher quality
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
      alert(`Failed to generate certificate: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (showCertificate) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/courses" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Classroom
        </Link>

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
                border: '20px double #1e3a8a', // Explicit hex for blue-900
                color: '#111827' // Explicit hex for gray-900
              }}
            >
              {/* Watermark/Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                {logoBase64 && <Image src={logoBase64} alt="Watermark" width={500} height={500} className="w-[500px] h-[500px] object-contain" unoptimized />}
              </div>

              <div className="relative z-10 w-full flex flex-col items-center">
                {/* Logo at top */}
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
                     {/* Seal */}
                     <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 mb-2" style={{ backgroundColor: '#eab308', borderColor: '#ca8a04' }}>
                        <Award size={32} />
                     </div>
                  </div>
                  
                  <div className="text-center flex flex-col items-center relative">
                    {/* Signature positioned absolutely to overlap the line */}
                    <div className="absolute bottom-[10px] left-1/2 transform -translate-x-1/2 z-10">
                      {signBase64 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={signBase64} 
                          alt="Signature" 
                          style={{ 
                            height: '150px', 
                            width: 'auto', 
                            maxWidth: 'none' 
                          }} 
                        />
                      ) : (
                         <div className="text-9xl font-script font-cursive" style={{ fontFamily: 'cursive', color: '#1e3a8a' }}>Arpit</div>
                       )}
                    </div>
                    
                    {/* Name Line - Reduced margin to prevent overflow */}
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
              onClick={() => setShowCertificate(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Lesson
            </button>
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
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/courses" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Back to Classroom
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header / Blackboard */}
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
            <div className="mt-6 inline-block bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-sm">
              <span className="text-gray-400">Instructor:</span> <span className="text-white font-semibold">RojgaarNepal Team</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          
          {/* Introduction */}
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Introduction: Why Python?</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Python is one of the most popular and versatile programming languages in the world. 
              Known for its simplicity and readability, it&apos;s the perfect language for beginners. 
              From web development to data science and artificial intelligence, Python is everywhere.
              Let&apos;s start your journey into the world of programming!
            </p>
          </div>

          {/* Lesson 1: Variables */}
          <div className="bg-yellow-50 rounded-xl p-8 border border-yellow-100">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-500 text-white p-2 rounded-lg mr-4">
                <Terminal size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Lesson 1: Variables & Data Types</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Variables are like containers for storing data values. Python has no command for declaring a variable.
              A variable is created the moment you first assign a value to it.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-bold text-yellow-800 mb-3">Common Data Types</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1" /> <strong>String (str):</strong> Text data, e.g., &quot;Hello World&quot;</li>
                  <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1" /> <strong>Integer (int):</strong> Whole numbers, e.g., 10, -5</li>
                  <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1" /> <strong>Float (float):</strong> Decimal numbers, e.g., 3.14, -0.01</li>
                  <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1" /> <strong>Boolean (bool):</strong> True or False</li>
                </ul>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg shadow-sm text-white font-mono text-sm">
                <h4 className="font-bold text-yellow-400 mb-3 border-b border-slate-700 pb-2">Code Example</h4>
                <pre className="whitespace-pre-wrap">
{`# Creating variables
name = "Arpit"       # String
age = 25             # Integer
height = 5.9         # Float
is_student = True    # Boolean

print(name)
print(age)`}
                </pre>
              </div>
            </div>
          </div>

          {/* Lesson 2: Control Flow */}
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-4">
                <Cpu size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Lesson 2: Control Flow (If/Else)</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Control flow allows your program to make decisions. Python uses indentation to define blocks of code.
            </p>
            
            <div className="bg-slate-800 p-6 rounded-lg shadow-sm text-white font-mono text-sm">
                <h4 className="font-bold text-blue-400 mb-3 border-b border-slate-700 pb-2">Code Example</h4>
                <pre className="whitespace-pre-wrap">
{`score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
else:
    print("Grade: C")`}
                </pre>
            </div>
          </div>

           {/* Lesson 3: Loops */}
           <div className="bg-green-50 rounded-xl p-8 border border-green-100">
            <div className="flex items-center mb-6">
              <div className="bg-green-600 text-white p-2 rounded-lg mr-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Lesson 3: Loops</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Loops allow you to repeat a block of code multiple times.
            </p>
            
            <div className="bg-slate-800 p-6 rounded-lg shadow-sm text-white font-mono text-sm">
                <h4 className="font-bold text-green-400 mb-3 border-b border-slate-700 pb-2">Code Example</h4>
                <pre className="whitespace-pre-wrap">
{`# For Loop
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# While Loop
count = 0
while count < 5:
    print(count)
    count += 1`}
                </pre>
            </div>
          </div>

          {/* Conclusion & Quiz */}
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Certify?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              You&apos;ve learned the basics of Python! Click the button below to complete the course and generate your certificate.
            </p>
            <button 
              onClick={handleComplete}
              className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg flex items-center mx-auto"
            >
              <GraduationCap className="mr-2" />
              Complete Course & Get Certificate
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
