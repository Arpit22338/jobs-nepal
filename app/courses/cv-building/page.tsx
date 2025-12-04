"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, PenTool, CheckCircle, Star, AlertCircle, GraduationCap, Download, Award } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";

export default function CVCoursePage() {
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
        // Removed useCORS as we are using Base64 images
      });
      
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'Rojgaar_CV_Masterclass_Certificate.png';
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
            <p className="text-gray-600">Congratulations! You have successfully finished the CV Writing Masterclass.</p>
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
                <div className="mb-2">
                   {logoBase64 && <Image src={logoBase64} alt="Rojgaar Logo" width={200} height={64} className="h-16 w-auto object-contain" unoptimized />}
                </div>
                
                <div className="mb-2 font-bold tracking-widest uppercase text-sm" style={{ color: '#1e3a8a' }}>RojgaarNepal Skills Academy</div>
                <h1 className="text-4xl font-bold mb-4 font-serif" style={{ color: '#1e3a8a' }}>Certificate of Completion</h1>
                
                <p className="text-lg mb-4 italic" style={{ color: '#4b5563' }}>This is to certify that</p>
                
                <div className="text-3xl font-bold mb-2 border-b-2 inline-block px-10 py-1 min-w-[300px]" style={{ color: '#111827', borderColor: '#d1d5db' }}>
                  {session?.user?.name || "Student Name"}
                </div>
                
                <p className="text-lg mt-4 mb-4 italic" style={{ color: '#4b5563' }}>
                  has successfully completed the comprehensive course on
                </p>
                
                <h2 className="text-2xl font-bold mb-8" style={{ color: '#1e40af' }}>CV Writing Masterclass</h2>
                
                <div className="flex justify-between items-end w-full px-8 mt-8">
                  <div className="text-center flex flex-col items-center">
                    <div className="text-base font-bold border-b px-4 pb-1 mb-1 min-w-[120px]" style={{ color: '#1f2937', borderColor: '#9ca3af' }}>
                      {new Date().toLocaleDateString()}
                    </div>
                    <div className="text-xs" style={{ color: '#6b7280' }}>Date</div>
                  </div>

                  <div className="flex flex-col items-center">
                     {/* Seal */}
                     <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 mb-2" style={{ backgroundColor: '#eab308', borderColor: '#ca8a04' }}>
                        <Award size={40} />
                     </div>
                  </div>
                  
                  <div className="text-center flex flex-col items-center">
                    <div className="mb-1 h-16 flex items-end justify-center">
                       {signBase64 ? (
                         <Image src={signBase64} alt="Signature" width={200} height={64} className="h-16 w-auto object-contain" unoptimized />
                       ) : (
                         <div className="text-xl font-script font-cursive" style={{ fontFamily: 'cursive', color: '#1e3a8a' }}>Arpit</div>
                       )}
                    </div>
                    <div className="text-base font-bold border-t pt-2 px-4 min-w-[150px]" style={{ color: '#1f2937', borderColor: '#9ca3af' }}>
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
            <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-full mb-4">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">CV Writing Masterclass</h1>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto font-light">
              &quot;The Art of Professional Storytelling&quot;
            </p>
            <div className="mt-6 inline-block bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-sm">
              <span className="text-gray-400">Instructor:</span> <span className="text-white font-semibold">RojgaarNepal Team</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          
          {/* Introduction */}
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Introduction: Your CV is Your Story</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Welcome, class! Today, we are not just listing jobs on a piece of paper. We are learning to write a <strong>persuasive narrative</strong>. 
              Think of your CV (Curriculum Vitae) as a marketing brochure where <em>you</em> are the product. 
              Just like in an English essay, clarity, structure, and vocabulary matter immensely. 
              Let&apos;s break down the grammar of a perfect CV.
            </p>
          </div>

          {/* Lesson 1: Structure */}
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Lesson 1: The Syntax of Structure</h3>
            </div>
            <p className="text-gray-700 mb-6">
              In English, syntax is the arrangement of words to create well-formed sentences. In a CV, structure is the arrangement of sections to create a readable document.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-bold text-blue-800 mb-3">The Golden Rules</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1" /> <strong>Reverse Chronological Order:</strong> Start with the present, move to the past.</li>
                  <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1" /> <strong>One Page Rule:</strong> Unless you have 10+ years of experience, keep it to one page. Be concise.</li>
                  <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1" /> <strong>White Space:</strong> Don&apos;t cram text. Margins should be 0.5&quot; to 1&quot;.</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-bold text-red-800 mb-3">Common Syntax Errors</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start"><AlertCircle size={18} className="text-red-500 mr-2 mt-1" /> <strong>Photos:</strong> Do not include a photo unless applying for modeling or acting jobs (or if standard in your specific country).</li>
                  <li className="flex items-start"><AlertCircle size={18} className="text-red-500 mr-2 mt-1" /> <strong>Fancy Fonts:</strong> Avoid Comic Sans or cursive. Stick to Arial, Calibri, or Roboto.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lesson 2: Verbs */}
          <div className="bg-green-50 rounded-xl p-8 border border-green-100">
            <div className="flex items-center mb-6">
              <div className="bg-green-600 text-white p-2 rounded-lg mr-4">
                <PenTool size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Lesson 2: The Power of Verbs</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Weak verbs make weak sentences. Strong verbs show impact. We never use the phrase &quot;Responsible for&quot;. Instead, we use <strong>Action Verbs</strong>.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-green-100 text-green-800">
                    <th className="p-4 border-b border-green-200">Weak Phrasing (Passive)</th>
                    <th className="p-4 border-b border-green-200">Strong Phrasing (Active)</th>
                    <th className="p-4 border-b border-green-200">Why it works</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="p-4">&quot;I was responsible for sales.&quot;</td>
                    <td className="p-4 font-medium text-green-700">&quot;Generated $50,000 in revenue by targeting new clients.&quot;</td>
                    <td className="p-4 text-sm">Uses numbers and specific outcome.</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4">&quot;Helped with the project.&quot;</td>
                    <td className="p-4 font-medium text-green-700">&quot;Spearheaded the Q3 marketing project, leading a team of 5.&quot;</td>
                    <td className="p-4 text-sm">&quot;Spearheaded&quot; implies leadership.</td>
                  </tr>
                  <tr>
                    <td className="p-4">&quot;Talked to customers.&quot;</td>
                    <td className="p-4 font-medium text-green-700">&quot;Resolved 50+ customer inquiries daily with a 98% satisfaction rate.&quot;</td>
                    <td className="p-4 text-sm">Quantifies the workload and quality.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 bg-white p-4 rounded-lg border border-green-200">
              <h4 className="font-bold text-green-800 mb-2">Vocabulary List: Action Verbs</h4>
              <p className="text-sm text-gray-600">
                Achieved, Analyzed, Built, Created, Delivered, Enhanced, Facilitated, Generated, Improved, Launched, Managed, Negotiated, Organized, Pioneered, Reduced, Streamlined, Trained, Upgraded.
              </p>
            </div>
          </div>

          {/* Lesson 3: The STAR Method */}
          <div className="bg-purple-50 rounded-xl p-8 border border-purple-100">
            <div className="flex items-center mb-6">
              <div className="bg-purple-600 text-white p-2 rounded-lg mr-4">
                <Star size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Lesson 3: The STAR Method</h3>
            </div>
            <p className="text-gray-700 mb-6">
              When writing your bullet points, use the <strong>STAR</strong> formula to tell a complete story in one sentence.
            </p>
            
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-purple-400">
                <div className="font-bold text-purple-800 text-xl mb-1">S</div>
                <div className="font-semibold text-gray-800">Situation</div>
                <div className="text-xs text-gray-500 mt-2">What was the problem?</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-purple-500">
                <div className="font-bold text-purple-800 text-xl mb-1">T</div>
                <div className="font-semibold text-gray-800">Task</div>
                <div className="text-xs text-gray-500 mt-2">What was your goal?</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-purple-600">
                <div className="font-bold text-purple-800 text-xl mb-1">A</div>
                <div className="font-semibold text-gray-800">Action</div>
                <div className="text-xs text-gray-500 mt-2">What did YOU do?</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-purple-700">
                <div className="font-bold text-purple-800 text-xl mb-1">R</div>
                <div className="font-semibold text-gray-800">Result</div>
                <div className="text-xs text-gray-500 mt-2">What was the outcome?</div>
              </div>
            </div>

            <div className="mt-6 bg-white p-6 rounded-lg border border-purple-200">
              <h4 className="font-bold text-gray-900 mb-2">Example:</h4>
              <p className="text-gray-600 italic">
                &quot;Identified a bottleneck in supply chain (Situation), aimed to reduce delivery times (Task), implemented a new tracking software (Action), resulting in a 20% faster turnaround (Result).&quot;
              </p>
            </div>
          </div>

          {/* Homework */}
          <div className="border-t-2 border-dashed border-gray-200 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">📝 Class Assignment</h3>
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <p className="mb-4 text-gray-700">Before you apply for your next job, complete this checklist:</p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 mr-3" />
                  <span className="text-gray-700">I have removed all personal pronouns (I, me, my) from my bullet points.</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 mr-3" />
                  <span className="text-gray-700">I have checked for spelling errors (their vs. there, manager vs. manger).</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 mr-3" />
                  <span className="text-gray-700">Every bullet point starts with a strong Action Verb.</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 mr-3" />
                  <span className="text-gray-700">My contact email is professional (no nicknames).</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 mr-3" />
                  <span className="text-gray-700">I have saved the file as <code>FirstName_LastName_CV.pdf</code>.</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center text-lg"
              >
                <CheckCircle className="mr-2" size={24} />
                I Have Completed My Assignment
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
