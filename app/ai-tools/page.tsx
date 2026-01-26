"use client";

import Link from "next/link";
import { 
  FileText, Target, TrendingUp, 
  Sparkles, ArrowRight, Bot, Mic, Clock, 
  CheckCircle, Zap, Brain, BarChart3
} from "lucide-react";

const aiTools = [
  {
    name: "RojgaarAI Chat",
    href: "/messages/rojgaar-ai",
    icon: Bot,
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-500/10",
    description: "Your personal AI career assistant powered by advanced language models.",
    features: [
      "Get instant answers about job searching",
      "Resume and cover letter advice",
      "Interview tips and preparation",
      "Career guidance and planning",
      "Available 24/7 for your questions"
    ],
    howToUse: [
      "Click on RojgaarAI Chat to open the conversation",
      "Type your career-related question in the chat box",
      "Get instant, personalized responses",
      "Follow up with more questions as needed"
    ]
  },
  {
    name: "Resume Builder",
    href: "/ai-tools/resume-builder",
    icon: FileText,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    description: "Create professional, ATS-optimized resumes with AI assistance.",
    features: [
      "Multiple professional templates",
      "AI-powered content suggestions",
      "ATS-friendly formatting",
      "Export to PDF format",
      "Real-time preview"
    ],
    howToUse: [
      "Fill in your personal information",
      "Add your work experience and education",
      "Let AI enhance your descriptions",
      "Choose a template and customize",
      "Download your polished resume"
    ]
  },
  {
    name: "Interview Prep",
    href: "/ai-tools/interview-prep",
    icon: Mic,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    description: "Practice interviews with AI voice feedback and timed sessions.",
    features: [
      "AI-generated interview questions",
      "Voice mode with speech recognition",
      "Timed responses like real interviews",
      "Instant AI feedback on answers",
      "Video recording option",
      "Performance analysis and scoring"
    ],
    howToUse: [
      "Enter your target job title",
      "Select experience level and question count",
      "Choose text or voice mode",
      "Answer questions within the time limit",
      "Get detailed feedback and improvement tips"
    ]
  },
  {
    name: "Skills Gap Analysis",
    href: "/ai-tools/skills-gap",
    icon: TrendingUp,
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10",
    description: "Identify skill gaps and get a personalized learning roadmap.",
    features: [
      "Current skills assessment",
      "Target role comparison",
      "Gap identification",
      "Learning path recommendations",
      "Course suggestions",
      "Progress tracking"
    ],
    howToUse: [
      "Enter your current skills and experience",
      "Specify your target job or career goal",
      "AI analyzes the skill gaps",
      "Get personalized learning recommendations",
      "Follow the roadmap to upskill"
    ]
  },
  {
    name: "Job Matcher",
    href: "/ai-tools/job-matcher",
    icon: Target,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-500/10",
    description: "Find jobs that perfectly match your skills and preferences.",
    features: [
      "AI-powered job matching",
      "Skills-based recommendations",
      "Preference filtering",
      "Match score calculation",
      "Direct application links"
    ],
    howToUse: [
      "Enter your skills and experience",
      "Set your job preferences (location, salary, type)",
      "AI matches you with suitable jobs",
      "Review match scores and job details",
      "Apply directly to matched jobs"
    ]
  }
];

export default function AIToolsPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-purple-500/5" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
              <Sparkles size={16} className="animate-pulse" />
              Powered by Advanced AI
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground">
              <span className="text-primary">AI</span> Career Tools
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Supercharge your job search with our suite of AI-powered tools. 
              From resume building to interview practice, we&apos;ve got you covered.
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">100% Free</p>
                  <p className="text-xs text-muted-foreground">No hidden charges</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Zap className="text-blue-500" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">Instant Results</p>
                  <p className="text-xs text-muted-foreground">AI-powered speed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Brain className="text-purple-500" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">Smart Analysis</p>
                  <p className="text-xs text-muted-foreground">Personalized advice</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tools Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {aiTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.name}
                className={`relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm ${
                  index % 2 === 0 ? "" : "md:flex-row-reverse"
                }`}
              >
                {/* Gradient Background */}
                <div className={`absolute top-0 ${index % 2 === 0 ? "right-0" : "left-0"} w-1/2 h-full bg-linear-to-br ${tool.color} opacity-5`} />
                
                <div className="relative p-6 md:p-10">
                  <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left: Info */}
                    <div className={`space-y-6 ${index % 2 === 0 ? "" : "md:order-2"}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl ${tool.bgColor} flex items-center justify-center`}>
                          <Icon size={32} className={`bg-linear-to-br ${tool.color} bg-clip-text text-transparent`} style={{ color: tool.color.includes("cyan") ? "#06b6d4" : tool.color.includes("purple") ? "#a855f7" : tool.color.includes("green") ? "#22c55e" : tool.color.includes("orange") ? "#f97316" : "#3b82f6" }} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">{tool.name}</h2>
                          <p className="text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <BarChart3 size={14} className="text-primary" /> Features
                        </h3>
                        <ul className="space-y-2">
                          {tool.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-none" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link
                        href={tool.href}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r ${tool.color} text-white font-bold hover:opacity-90 transition-all hover:scale-105 shadow-lg`}
                      >
                        Try {tool.name} <ArrowRight size={18} />
                      </Link>
                    </div>

                    {/* Right: How to Use */}
                    <div className={`space-y-4 ${index % 2 === 0 ? "" : "md:order-1"}`}>
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Clock size={14} className="text-primary" /> How to Use
                      </h3>
                      <div className="space-y-3">
                        {tool.howToUse.map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full bg-linear-to-br ${tool.color} flex items-center justify-center text-white font-bold text-sm flex-none`}>
                              {i + 1}
                            </div>
                            <p className="text-sm text-foreground pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center space-y-6 p-8 rounded-3xl bg-linear-to-br from-primary/10 to-purple-500/10 border border-primary/20">
          <h2 className="text-3xl font-bold text-foreground">Ready to Boost Your Career?</h2>
          <p className="text-muted-foreground">
            Start using our AI tools today and take the next step in your career journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/messages/rojgaar-ai"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all"
            >
              <Bot size={20} /> Chat with RojgaarAI
            </Link>
            <Link
              href="/ai-tools/resume-builder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-foreground font-bold hover:bg-accent/80 transition-all border border-border"
            >
              <FileText size={20} /> Build Your Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
