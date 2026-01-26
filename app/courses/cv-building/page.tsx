"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import CertificateTemplate from "@/components/CertificateTemplate";

// Course Data
const MODULES = [
  {
    id: "basics",
    title: "CV Fundamentals",
    icon: "bx-file-blank",
    color: "cyan",
    lessons: [
      { id: "structure", title: "CV Structure & Layout", duration: "5 min" },
      { id: "sections", title: "Essential Sections", duration: "7 min" },
    ],
    quiz: {
      question: "What's the ideal CV length for someone with less than 10 years of experience?",
      options: ["3-4 pages", "2-3 pages", "1 page", "As long as needed"],
      correct: 2,
    }
  },
  {
    id: "writing",
    title: "Writing Techniques",
    icon: "bx-pen",
    color: "green",
    lessons: [
      { id: "verbs", title: "Power Verbs & Action Words", duration: "6 min" },
      { id: "star", title: "STAR Method for Achievements", duration: "8 min" },
      { id: "quantify", title: "Quantifying Your Impact", duration: "5 min" },
    ],
    quiz: {
      question: "Which is a better way to describe your experience?",
      options: [
        "Responsible for sales team",
        "Generated $50K in Q3 revenue",
        "Helped with marketing tasks",
        "Worked in customer service"
      ],
      correct: 1,
    }
  },
  {
    id: "ats",
    title: "ATS Optimization",
    icon: "bx-target-lock",
    color: "orange",
    lessons: [
      { id: "keywords", title: "Keywords & Job Matching", duration: "6 min" },
      { id: "format", title: "ATS-Friendly Formatting", duration: "5 min" },
    ],
    quiz: {
      question: "What percentage of CVs are rejected by ATS before reaching humans?",
      options: ["25%", "50%", "75%", "90%"],
      correct: 2,
    }
  },
  {
    id: "polish",
    title: "Final Polish",
    icon: "bx-check-shield",
    color: "purple",
    lessons: [
      { id: "mistakes", title: "Common Mistakes to Avoid", duration: "7 min" },
      { id: "proofread", title: "Proofreading Checklist", duration: "4 min" },
      { id: "templates", title: "Templates & Resources", duration: "5 min" },
    ],
    quiz: {
      question: "Which should you REMOVE from your CV?",
      options: [
        "LinkedIn URL",
        "References available upon request",
        "Relevant skills",
        "Work experience"
      ],
      correct: 1,
    }
  },
];

// Lesson content
const LESSON_CONTENT: Record<string, { title: string; content: React.ReactNode }> = {
  structure: {
    title: "CV Structure & Layout",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Your CV should follow a clear, logical structure that guides recruiters through your professional story.</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20">
            <h4 className="font-bold text-green-500 mb-3 flex items-center gap-2">
              <i className="bx bx-check-circle"></i> Golden Rules
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Reverse chronological</strong> - most recent first</li>
              <li>• <strong>One page</strong> unless 10+ years experience</li>
              <li>• <strong>Consistent formatting</strong> throughout</li>
              <li>• <strong>0.5-1 inch margins</strong> for readability</li>
              <li>• <strong>10-12pt font size</strong> for body text</li>
            </ul>
          </div>
          
          <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20">
            <h4 className="font-bold text-red-500 mb-3 flex items-center gap-2">
              <i className="bx bx-x-circle"></i> Avoid These
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Photos (unless culturally required)</li>
              <li>• Fancy or decorative fonts</li>
              <li>• Graphics that break ATS</li>
              <li>• Long paragraphs without bullets</li>
              <li>• Multiple columns</li>
            </ul>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-accent/50 border border-border">
          <h4 className="font-bold text-foreground mb-3">Professional Fonts</h4>
          <div className="flex flex-wrap gap-3">
            {["Arial", "Calibri", "Cambria", "Georgia", "Helvetica"].map(font => (
              <span key={font} className="px-3 py-1.5 bg-background rounded-lg text-sm border border-border">{font}</span>
            ))}
          </div>
        </div>
      </div>
    )
  },
  sections: {
    title: "Essential CV Sections",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Every professional CV should include these key sections in the right order.</p>
        
        <div className="space-y-3">
          {[
            { num: 1, title: "Header", desc: "Name, phone, email, LinkedIn, location", icon: "bx-user" },
            { num: 2, title: "Professional Summary", desc: "2-3 sentences showcasing your value", icon: "bx-message-square-detail" },
            { num: 3, title: "Work Experience", desc: "Job titles, companies, dates, achievements", icon: "bx-briefcase" },
            { num: 4, title: "Education", desc: "Degrees, institutions, graduation years", icon: "bx-graduation" },
            { num: 5, title: "Skills", desc: "Technical and soft skills relevant to the role", icon: "bx-star" },
            { num: 6, title: "Projects/Portfolio", desc: "Notable work samples (optional)", icon: "bx-folder" },
          ].map(section => (
            <div key={section.num} className="flex items-start gap-4 p-4 rounded-xl bg-accent/30 border border-border hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <i className={`bx ${section.icon} text-xl text-primary`}></i>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{section.num}. {section.title}</h4>
                <p className="text-sm text-muted-foreground">{section.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  verbs: {
    title: "Power Verbs & Action Words",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Transform weak phrases into impactful statements using power verbs.</p>
        
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="p-4 text-left text-red-500">❌ Weak</th>
                <th className="p-4 text-left text-green-500">✅ Strong</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-t border-border"><td className="p-4">&quot;Responsible for sales&quot;</td><td className="p-4 text-green-500 font-medium">&quot;Generated $50K revenue&quot;</td></tr>
              <tr className="border-t border-border"><td className="p-4">&quot;Helped with marketing&quot;</td><td className="p-4 text-green-500 font-medium">&quot;Spearheaded Q3 campaign&quot;</td></tr>
              <tr className="border-t border-border"><td className="p-4">&quot;Worked on support&quot;</td><td className="p-4 text-green-500 font-medium">&quot;Resolved 50+ tickets daily&quot;</td></tr>
            </tbody>
          </table>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { cat: "Leadership", verbs: "Directed, Led, Managed, Mentored" },
            { cat: "Achievement", verbs: "Achieved, Exceeded, Delivered, Won" },
            { cat: "Creation", verbs: "Built, Designed, Developed, Launched" },
            { cat: "Problem-Solving", verbs: "Resolved, Optimized, Streamlined" },
          ].map(item => (
            <div key={item.cat} className="p-4 rounded-xl bg-accent/30 border border-border">
              <h5 className="font-semibold text-foreground mb-2">{item.cat}</h5>
              <p className="text-xs text-muted-foreground">{item.verbs}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  star: {
    title: "STAR Method for Achievements",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Turn bullet points into compelling achievement stories.</p>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
            <div className="text-3xl font-black text-purple-500 mb-1">S</div>
            <div className="font-semibold text-foreground text-sm">Situation</div>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
            <div className="text-3xl font-black text-blue-500 mb-1">T</div>
            <div className="font-semibold text-foreground text-sm">Task</div>
          </div>
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
            <div className="text-3xl font-black text-cyan-500 mb-1">A</div>
            <div className="font-semibold text-foreground text-sm">Action</div>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-3xl font-black text-green-500 mb-1">R</div>
            <div className="font-semibold text-foreground text-sm">Result</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-red-500 font-semibold">Before: </span>
            <span className="text-muted-foreground">&quot;Managed social media accounts&quot;</span>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <span className="text-green-500 font-semibold">After: </span>
            <span className="text-muted-foreground">&quot;Revamped social media strategy, increasing followers by 150% in 6 months&quot;</span>
          </div>
        </div>
      </div>
    )
  },
  quantify: {
    title: "Quantifying Your Impact",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Numbers make your achievements tangible and memorable.</p>
        
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "bx-dollar", title: "Money", examples: "Saved $10K, Generated $50K" },
            { icon: "bx-time", title: "Time", examples: "Reduced process by 40%" },
            { icon: "bx-group", title: "People", examples: "Managed team of 8" },
            { icon: "bx-bar-chart", title: "Percentages", examples: "Increased sales 25%" },
            { icon: "bx-trophy", title: "Rankings", examples: "Top 5%, #1 in region" },
            { icon: "bx-check-double", title: "Volume", examples: "Handled 100+ clients" },
          ].map(item => (
            <div key={item.title} className="p-4 rounded-xl bg-accent/30 border border-border">
              <i className={`bx ${item.icon} text-2xl text-primary mb-2`}></i>
              <h5 className="font-semibold text-foreground">{item.title}</h5>
              <p className="text-xs text-muted-foreground mt-1">{item.examples}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  keywords: {
    title: "Keywords & Job Matching",
    content: (
      <div className="space-y-6">
        <div className="p-5 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-orange-500 font-semibold"><i className="bx bx-error mr-2"></i>75% of CVs are rejected by ATS before humans see them!</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-accent/50 border border-border">
            <h4 className="font-bold text-foreground mb-3">How to Find Keywords</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1. Read the job description carefully</li>
              <li>2. Highlight required skills</li>
              <li>3. Note repeated terms</li>
              <li>4. Include exact matches in your CV</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl bg-accent/50 border border-border">
            <h4 className="font-bold text-foreground mb-3">Keyword Placement</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Professional summary</li>
              <li>• Skills section</li>
              <li>• Work experience bullets</li>
              <li>• Job titles if applicable</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  format: {
    title: "ATS-Friendly Formatting",
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20">
            <h4 className="font-bold text-green-500 mb-3">✅ ATS-Friendly</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Standard section headings</li>
              <li>• Simple single-column layout</li>
              <li>• PDF or DOCX format</li>
              <li>• Standard bullet points</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20">
            <h4 className="font-bold text-red-500 mb-3">❌ ATS Killers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Tables and text boxes</li>
              <li>• Headers/footers for contact</li>
              <li>• Images or icons</li>
              <li>• Fancy fonts or colors</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  mistakes: {
    title: "Common Mistakes to Avoid",
    content: (
      <div className="space-y-4">
        {[
          { mistake: "Generic objective statement", fix: "Write a specific summary" },
          { mistake: "Listing duties instead of achievements", fix: "Focus on impact and results" },
          { mistake: "'References available upon request'", fix: "Remove it - it's assumed" },
          { mistake: "Using personal pronouns (I, me)", fix: "Start with action verbs" },
          { mistake: "Inconsistent date formats", fix: "Use same format throughout" },
          { mistake: "Unprofessional email address", fix: "Use firstname.lastname@gmail.com" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-accent/30 border border-border">
            <i className="bx bx-x-circle text-xl text-red-500 shrink-0"></i>
            <div>
              <p className="text-red-500 line-through">{item.mistake}</p>
              <p className="text-green-500 text-sm mt-1">✓ {item.fix}</p>
            </div>
          </div>
        ))}
      </div>
    )
  },
  proofread: {
    title: "Proofreading Checklist",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Before submitting, check every item.</p>
        
        <div className="space-y-3">
          {[
            "Spelling and grammar checked",
            "Consistent formatting throughout",
            "All dates are accurate",
            "Contact information is correct",
            "Links work (LinkedIn, portfolio)",
            "File name is professional",
            "Have someone else review it",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{i + 1}</span>
              </div>
              <span className="text-muted-foreground text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  templates: {
    title: "Templates & Resources",
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Chronological", desc: "For consistent work history", badge: "Most Common" },
            { name: "Functional", desc: "For career changers", badge: "Skill-Based" },
            { name: "Combination", desc: "Mix of both styles", badge: "Flexible" },
          ].map(template => (
            <div key={template.name} className="p-5 rounded-xl bg-accent/50 border border-border">
              <h4 className="font-bold text-foreground">{template.name}</h4>
              <p className="text-sm text-muted-foreground mt-1 mb-3">{template.desc}</p>
              <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{template.badge}</span>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
          <h4 className="font-bold text-foreground mb-4"><i className="bx bx-download mr-2"></i>Free Resources</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <a href="https://www.canva.com/resumes/templates/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors">
              <i className="bx bx-link-external text-primary"></i>
              <span className="text-sm">Canva Resume Templates</span>
            </a>
            <a href="https://novoresume.com/resume-templates" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors">
              <i className="bx bx-link-external text-primary"></i>
              <span className="text-sm">NovoResume Templates</span>
            </a>
          </div>
        </div>
      </div>
    )
  },
};

export default function CVCoursePage() {
  const { data: session } = useSession();
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const activeModule = MODULES[activeModuleIndex];
  const activeLesson = activeModule.lessons[activeLessonIndex];
  const lessonContent = LESSON_CONTENT[activeLesson.id];
  
  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const progress = Math.round((completedLessons.length / totalLessons) * 100);

  const markComplete = () => {
    if (!completedLessons.includes(activeLesson.id)) {
      setCompletedLessons([...completedLessons, activeLesson.id]);
    }
  };

  const nextLesson = () => {
    markComplete();
    if (activeLessonIndex < activeModule.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    } else {
      setShowQuiz(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    if (quizAnswer === activeModule.quiz.correct) {
      setTimeout(() => {
        if (activeModuleIndex < MODULES.length - 1) {
          setActiveModuleIndex(activeModuleIndex + 1);
          setActiveLessonIndex(0);
          setShowQuiz(false);
          setQuizAnswer(null);
          setQuizSubmitted(false);
        } else {
          handleCourseComplete();
        }
      }, 1500);
    }
  };

  const handleCourseComplete = async () => {
    setShowCertificate(true);
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

  if (showCertificate) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/courses" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
            <i className="bx bx-arrow-back mr-2"></i> Back to Courses
          </Link>
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bx bx-trophy text-4xl text-green-500"></i>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Congratulations!</h2>
              <p className="text-muted-foreground">You have completed the CV Building Masterclass.</p>
            </div>
            <div className="flex justify-center overflow-auto py-4">
              <CertificateTemplate
                studentName={session?.user?.name || "Student"}
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-linear-to-r from-cyan-600 to-blue-600 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/courses" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors text-sm">
            <i className="bx bx-arrow-back mr-2"></i> Back to Courses
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <i className="bx bx-file-blank text-3xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">CV Writing Masterclass</h1>
              <p className="text-white/70">Master the art of professional CV writing</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>{completedLessons.length} of {totalLessons} lessons</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="border-b border-border bg-card/50 sticky top-12 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {MODULES.map((module, i) => (
              <button
                key={module.id}
                onClick={() => { setActiveModuleIndex(i); setActiveLessonIndex(0); setShowQuiz(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeModuleIndex === i
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <i className={`bx ${module.icon}`}></i>
                {module.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-4 sticky top-32">
              <h3 className="font-bold text-foreground mb-4">{activeModule.title}</h3>
              <nav className="space-y-1">
                {activeModule.lessons.map((lesson, i) => (
                  <button
                    key={lesson.id}
                    onClick={() => { setActiveLessonIndex(i); setShowQuiz(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-colors ${
                      activeLessonIndex === i && !showQuiz
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    {completedLessons.includes(lesson.id) ? (
                      <i className="bx bx-check-circle text-green-500"></i>
                    ) : (
                      <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">{i + 1}</span>
                    )}
                    <span className="flex-1">{lesson.title}</span>
                    <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                  </button>
                ))}
                <button
                  onClick={() => setShowQuiz(true)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-colors ${
                    showQuiz ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" : "hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <i className="bx bx-help-circle"></i>
                  <span>Module Quiz</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {showQuiz ? (
              <div className="bg-card rounded-xl border border-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <i className="bx bx-help-circle text-2xl text-orange-500"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Module Quiz</h2>
                    <p className="text-sm text-muted-foreground">Test your understanding</p>
                  </div>
                </div>

                <p className="text-lg text-foreground mb-6">{activeModule.quiz.question}</p>

                <div className="space-y-3 mb-8">
                  {activeModule.quiz.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => !quizSubmitted && setQuizAnswer(i)}
                      disabled={quizSubmitted}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${
                        quizSubmitted
                          ? i === activeModule.quiz.correct
                            ? "bg-green-500/10 border-green-500 text-green-500"
                            : quizAnswer === i
                              ? "bg-red-500/10 border-red-500 text-red-500"
                              : "border-border text-muted-foreground"
                          : quizAnswer === i
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border hover:border-primary/30 text-muted-foreground"
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + i)}.</span> {option}
                    </button>
                  ))}
                </div>

                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={quizAnswer === null}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                ) : quizAnswer === activeModule.quiz.correct ? (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
                    <i className="bx bx-check-circle mr-2"></i>
                    Correct! Moving to next module...
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                      <i className="bx bx-x-circle mr-2"></i>
                      Incorrect. The correct answer is highlighted above.
                    </div>
                    <button
                      onClick={() => { setQuizAnswer(null); setQuizSubmitted(false); }}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <i className={`bx ${activeModule.icon} text-2xl text-primary`}></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{lessonContent.title}</h2>
                    <p className="text-sm text-muted-foreground">{activeLesson.duration} read</p>
                  </div>
                </div>

                {lessonContent.content}

                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <button
                    onClick={() => {
                      if (activeLessonIndex > 0) {
                        setActiveLessonIndex(activeLessonIndex - 1);
                      } else if (activeModuleIndex > 0) {
                        setActiveModuleIndex(activeModuleIndex - 1);
                        setActiveLessonIndex(MODULES[activeModuleIndex - 1].lessons.length - 1);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={activeModuleIndex === 0 && activeLessonIndex === 0}
                    className="px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-50 transition-colors"
                  >
                    <i className="bx bx-chevron-left mr-1"></i> Previous
                  </button>
                  <button
                    onClick={nextLesson}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    {activeLessonIndex === activeModule.lessons.length - 1 ? "Take Quiz" : "Next Lesson"} <i className="bx bx-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
