"use client";

import Link from "next/link";
import { 
  ArrowLeft, CheckCircle, AlertCircle, PenTool, Star, 
  FileText, Target, Sparkles, Award, BookOpen, 
  Lightbulb, ChevronRight, Download, Eye, 
  Briefcase, GraduationCap, Users, TrendingUp
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import CertificateTemplate from "@/components/CertificateTemplate";

const LESSONS = [
  { id: "structure", title: "CV Structure", icon: FileText },
  { id: "verbs", title: "Power Verbs", icon: PenTool },
  { id: "star", title: "STAR Method", icon: Star },
  { id: "ats", title: "ATS Optimization", icon: Target },
  { id: "proof", title: "Proof of Work", icon: Award },
  { id: "mistakes", title: "Common Mistakes", icon: AlertCircle },
  { id: "templates", title: "Templates", icon: FileText },
];

export default function CVCoursePage() {
  const { data: session } = useSession();
  const [showCertificate, setShowCertificate] = useState(false);
  const [activeLesson, setActiveLesson] = useState("structure");
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const handleComplete = async () => {
    setShowCertificate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      await fetch("/api/courses/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: "cv-building" }),
      });
    } catch (err) {
      console.error("Failed to mark completion", err);
    }
  };

  const markLessonComplete = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  const nextLesson = () => {
    const currentIndex = LESSONS.findIndex(l => l.id === activeLesson);
    if (currentIndex < LESSONS.length - 1) {
      markLessonComplete(activeLesson);
      setActiveLesson(LESSONS[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const progress = (completedLessons.length / LESSONS.length) * 100;

  if (showCertificate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/courses" className="inline-flex items-center text-gray-400 hover:text-cyan-400 mb-8 transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Back to Classroom
          </Link>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                <Award size={40} className="text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">🎉 Course Completed!</h2>
              <p className="text-gray-400">Congratulations! You&apos;ve mastered CV writing.</p>
            </div>
            <div className="flex justify-center mb-8 overflow-auto py-4">
              <CertificateTemplate
                studentName={session?.user?.name || "Student Name"}
                courseName="CV Writing Masterclass"
                completionDate={new Date().toISOString()}
                instructorName="RojgaarNepal Team"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 py-16">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-5xl mx-auto px-4">
          <Link href="/courses" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Back to Classroom
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <FileText size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white">CV Writing Masterclass</h1>
              <p className="text-xl text-white/80 mt-2">Transform your career story into a winning CV</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <BookOpen size={16} className="text-white" /><span className="text-white text-sm">7 Lessons</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Users size={16} className="text-white" /><span className="text-white text-sm">Beginner Friendly</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Award size={16} className="text-white" /><span className="text-white text-sm">Certificate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm font-bold text-cyan-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 sticky top-24">
              <h3 className="font-bold text-white mb-4">Lessons</h3>
              <nav className="space-y-2">
                {LESSONS.map((lesson, index) => {
                  const Icon = lesson.icon;
                  const isActive = activeLesson === lesson.id;
                  const isCompleted = completedLessons.includes(lesson.id);
                  return (
                    <button key={lesson.id} onClick={() => setActiveLesson(lesson.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${isActive ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400" : "hover:bg-slate-700 text-gray-400"}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCompleted ? "bg-green-500/20" : isActive ? "bg-cyan-500/20" : "bg-slate-700"}`}>
                        {isCompleted ? <CheckCircle size={16} className="text-green-500" /> : <Icon size={16} className={isActive ? "text-cyan-400" : "text-gray-500"} />}
                      </div>
                      <span className="text-sm font-medium">{index + 1}. {lesson.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {activeLesson === "structure" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/20 rounded-lg"><FileText size={24} className="text-blue-400" /></div>
                  <h2 className="text-2xl font-bold text-white">Lesson 1: CV Structure & Syntax</h2>
                </div>
                <p className="text-gray-300 text-lg mb-6">Your CV needs a clear structure that guides the reader through your professional story.</p>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <h4 className="font-bold text-green-400 mb-4 flex items-center gap-2"><CheckCircle size={18} /> Golden Rules</h4>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-2"><ChevronRight size={16} className="text-green-400 mt-1" /><span><strong>Reverse Chronological:</strong> Most recent first</span></li>
                      <li className="flex items-start gap-2"><ChevronRight size={16} className="text-green-400 mt-1" /><span><strong>One Page:</strong> Unless 10+ years experience</span></li>
                      <li className="flex items-start gap-2"><ChevronRight size={16} className="text-green-400 mt-1" /><span><strong>White Space:</strong> 0.5&quot; to 1&quot; margins</span></li>
                      <li className="flex items-start gap-2"><ChevronRight size={16} className="text-green-400 mt-1" /><span><strong>Font Size:</strong> 10-12pt for body</span></li>
                    </ul>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                    <h4 className="font-bold text-red-400 mb-4 flex items-center gap-2"><AlertCircle size={18} /> Common Errors</h4>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-2"><AlertCircle size={16} className="text-red-400 mt-1" /><span><strong>Photos:</strong> Avoid unless required</span></li>
                      <li className="flex items-start gap-2"><AlertCircle size={16} className="text-red-400 mt-1" /><span><strong>Fancy Fonts:</strong> Use Arial, Calibri</span></li>
                      <li className="flex items-start gap-2"><AlertCircle size={16} className="text-red-400 mt-1" /><span><strong>Graphics:</strong> May break ATS</span></li>
                      <li className="flex items-start gap-2"><AlertCircle size={16} className="text-red-400 mt-1" /><span><strong>Long Paragraphs:</strong> Use bullets</span></li>
                    </ul>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-4">📋 Essential CV Sections</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {["Header (Name, Contact, LinkedIn)", "Summary (2-3 sentences)", "Experience (Achievements)", "Education (Degrees)", "Skills (Technical + Soft)", "Projects (Portfolio)"].map((section, i) => (
                      <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                        <div className="text-cyan-400 font-bold mb-1">{i + 1}.</div>
                        <p className="text-sm text-gray-400">{section}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeLesson === "verbs" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-500/20 rounded-lg"><PenTool size={24} className="text-green-400" /></div>
                  <h2 className="text-2xl font-bold text-white">Lesson 2: Power Verbs</h2>
                </div>
                <p className="text-gray-300 text-lg mb-6">Transform weak phrases into impactful statements.</p>
                <div className="bg-slate-700/50 rounded-xl overflow-hidden mb-8">
                  <table className="w-full">
                    <thead className="bg-slate-700"><tr><th className="p-4 text-left text-red-400">❌ Weak</th><th className="p-4 text-left text-green-400">✅ Strong</th></tr></thead>
                    <tbody className="text-gray-300">
                      <tr className="border-t border-slate-600"><td className="p-4">&quot;Responsible for sales&quot;</td><td className="p-4 text-green-400">&quot;Generated $50K revenue&quot;</td></tr>
                      <tr className="border-t border-slate-600"><td className="p-4">&quot;Helped with marketing&quot;</td><td className="p-4 text-green-400">&quot;Spearheaded Q3 campaign&quot;</td></tr>
                      <tr className="border-t border-slate-600"><td className="p-4">&quot;Worked on support&quot;</td><td className="p-4 text-green-400">&quot;Resolved 50+ tickets daily&quot;</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
                  <h4 className="font-bold text-cyan-400 mb-4"><Sparkles size={18} className="inline mr-2" />Power Verb Categories</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div><h5 className="font-semibold text-white mb-2">Leadership</h5><p className="text-gray-400">Directed, Led, Managed, Mentored</p></div>
                    <div><h5 className="font-semibold text-white mb-2">Achievement</h5><p className="text-gray-400">Achieved, Exceeded, Generated</p></div>
                    <div><h5 className="font-semibold text-white mb-2">Creation</h5><p className="text-gray-400">Built, Designed, Developed, Launched</p></div>
                    <div><h5 className="font-semibold text-white mb-2">Problem-Solving</h5><p className="text-gray-400">Resolved, Optimized, Streamlined</p></div>
                  </div>
                </div>
              </div>
            )}

            {activeLesson === "star" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500/20 rounded-lg"><Star size={24} className="text-purple-400" /></div>
                  <h2 className="text-2xl font-bold text-white">Lesson 3: STAR Method</h2>
                </div>
                <p className="text-gray-300 text-lg mb-6">Turn bullet points into compelling stories.</p>
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                  {[{l:"S",t:"Situation",c:"purple"},{l:"T",t:"Task",c:"blue"},{l:"A",t:"Action",c:"cyan"},{l:"R",t:"Result",c:"green"}].map(i=>(
                    <div key={i.l} className={`bg-${i.c}-500/10 border border-${i.c}-500/20 rounded-xl p-6 text-center`}>
                      <div className={`text-4xl font-black text-${i.c}-400 mb-2`}>{i.l}</div>
                      <div className="font-bold text-white">{i.t}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-4"><Lightbulb size={18} className="inline mr-2 text-yellow-400" />Example</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"><span className="text-red-400 font-semibold">Before: </span><span className="text-gray-300">&quot;Managed social media&quot;</span></div>
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"><span className="text-green-400 font-semibold">After: </span><span className="text-gray-300">&quot;Revamped social strategy, creating viral content and engaging influencers, growing followers 150%&quot;</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeLesson === "ats" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-500/20 rounded-lg"><Target size={24} className="text-orange-400" /></div>
                  <h2 className="text-2xl font-bold text-white">Lesson 4: ATS Optimization</h2>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 mb-6">
                  <p className="text-orange-300"><strong>75% of CVs</strong> are rejected by ATS before humans see them!</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <h4 className="font-bold text-green-400 mb-4">✅ ATS-Friendly</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• Standard headings (Experience, Skills)</li>
                      <li>• Keywords from job description</li>
                      <li>• PDF or DOCX format</li>
                      <li>• Simple single-column layout</li>
                    </ul>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                    <h4 className="font-bold text-red-400 mb-4">❌ ATS Killers</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• Tables and text boxes</li>
                      <li>• Headers/footers for contact</li>
                      <li>• Images or icons</li>
                      <li>• Creative fonts/colors</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeLesson === "proof" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/20 rounded-lg"><Award size={24} className="text-indigo-400" /></div>
                  <h2 className="text-2xl font-bold text-white">Lesson 5: Proof of Work</h2>
                </div>
                <p className="text-gray-300 text-lg mb-6">Show, don&apos;t just tell. Evidence beats claims.</p>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-700/50 rounded-xl p-6 text-center">
                    <Briefcase size={32} className="text-cyan-400 mx-auto mb-3" />
                    <h4 className="font-bold text-white mb-2">Portfolio</h4>
                    <p className="text-sm text-gray-400">Best 3-5 projects with outcomes</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-6 text-center">
                    <GraduationCap size={32} className="text-purple-400 mx-auto mb-3" />
                    <h4 className="font-bold text-white mb-2">Certifications</h4>
                    <p className="text-sm text-gray-400">Verifiable credentials</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-6 text-center">
                    <TrendingUp size={32} className="text-green-400 mx-auto mb-3" />
                    <h4 className="font-bold text-white mb-2">Metrics</h4>
                    <p className="text-sm text-gray-400">Numbers and percentages</p>
                  </div>
                </div>
              </div>
            )}

            {activeLesson === "mistakes" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-500/20 rounded-lg"><AlertCircle size={24} className="text-red-400" /></div>
                  <h2 className="text-2xl font-bold text-white">Lesson 6: Common Mistakes</h2>
                </div>
                <div className="space-y-4">
                  {[
                    {m:"Generic objectives",f:"Write specific summary with value"},
                    {m:"Job duties instead of achievements",f:"Focus on impact and results"},
                    {m:"'References available upon request'",f:"Remove it - it's assumed"},
                    {m:"Personal pronouns (I, me)",f:"Start with action verbs"},
                    {m:"Inconsistent formatting",f:"Same date format, bullet style"},
                    {m:"Typos and errors",f:"Proofread 3x, use Grammarly"},
                    {m:"Unprofessional email",f:"Use firstname.lastname@gmail.com"},
                  ].map((item,i)=>(
                    <div key={i} className="flex gap-4 p-4 bg-slate-700/50 rounded-xl">
                      <AlertCircle size={16} className="text-red-400 mt-1 shrink-0" />
                      <div><div className="text-red-400 font-medium line-through mb-1">{item.m}</div><div className="text-green-400 text-sm">✓ {item.f}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeLesson === "templates" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-cyan-500/20 rounded-lg"><FileText size={24} className="text-cyan-400" /></div>
                  <h2 className="text-2xl font-bold text-white">Lesson 7: CV Templates</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                    <h4 className="font-bold text-white mb-2">Chronological</h4>
                    <p className="text-sm text-gray-400 mb-4">For consistent work history</p>
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">Most Common</span>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                    <h4 className="font-bold text-white mb-2">Functional</h4>
                    <p className="text-sm text-gray-400 mb-4">For career changers</p>
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Skill-Based</span>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                    <h4 className="font-bold text-white mb-2">Combination</h4>
                    <p className="text-sm text-gray-400 mb-4">Mix of both</p>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Flexible</span>
                  </div>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-4"><Download size={18} className="inline mr-2" />Free Resources</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <a href="https://www.canva.com/resumes/templates/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                      <Eye size={20} className="text-cyan-400" /><span className="text-gray-300">Canva Templates</span>
                    </a>
                    <a href="https://novoresume.com/resume-templates" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                      <Eye size={20} className="text-purple-400" /><span className="text-gray-300">NovoResume</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <button onClick={()=>{const i=LESSONS.findIndex(l=>l.id===activeLesson);if(i>0){setActiveLesson(LESSONS[i-1].id);window.scrollTo({top:0,behavior:'smooth'})}}}
                disabled={activeLesson===LESSONS[0].id} className="px-6 py-3 rounded-xl border border-slate-600 text-gray-400 hover:bg-slate-700 disabled:opacity-50">← Previous</button>
              {activeLesson===LESSONS[LESSONS.length-1].id ? (
                <button onClick={handleComplete} className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle size={20} /> Complete & Get Certificate
                </button>
              ) : (
                <button onClick={nextLesson} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl flex items-center gap-2">
                  Next Lesson <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
