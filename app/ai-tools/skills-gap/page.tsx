"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, Target, BookOpen, Clock, CheckCircle, AlertCircle,
  ChevronRight, Loader2, Sparkles, ArrowRight, BarChart3,
  Layers, GraduationCap, Briefcase
} from "lucide-react";

interface SkillLevel {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: "high" | "medium" | "low";
  timeToLearn: string;
}

interface LearningResource {
  title: string;
  type: string;
  url?: string;
  duration: string;
  priority: "essential" | "recommended" | "nice-to-have";
}

interface AnalysisResult {
  overallReadiness: number;
  skillGaps: SkillLevel[];
  strengths: string[];
  learningPath: {
    phase: string;
    duration: string;
    skills: string[];
    milestones: string[];
  }[];
  resources: LearningResource[];
  estimatedTimeToGoal: string;
  quickWins: string[];
  recommendations: string[];
}

const normalizeAnalysis = (analysis: any): AnalysisResult => {
  const missingSkills = Array.isArray(analysis?.missingSkills) ? analysis.missingSkills : [];
  const roadmap = Array.isArray(analysis?.roadmap) ? analysis.roadmap : [];
  const transferableSkills = Array.isArray(analysis?.transferableSkills) ? analysis.transferableSkills : [];
  const tips = Array.isArray(analysis?.tips) ? analysis.tips : [];

  const skillGaps: SkillLevel[] = missingSkills.map((gap: any) => ({
    skill: gap?.skill || "Unknown Skill",
    currentLevel: typeof gap?.currentLevel === "number" ? gap.currentLevel : 0,
    requiredLevel: typeof gap?.requiredLevel === "number" ? gap.requiredLevel : 5,
    priority: (gap?.priority as SkillLevel["priority"]) || "medium",
    timeToLearn: gap?.learningTime || gap?.timeToLearn || "Varies"
  }));

  const resources: LearningResource[] = Array.isArray(analysis?.resources)
    ? analysis.resources
    : missingSkills.flatMap((gap: any) => {
        const gapResources = Array.isArray(gap?.resources) ? gap.resources : [];
        return gapResources.map((resource: any) => {
          if (typeof resource === "string") {
            return {
              title: resource,
              type: "Resource",
              duration: "Self-paced",
              priority: "recommended"
            } as LearningResource;
          }
          return {
            title: resource?.title || resource?.name || "Resource",
            type: resource?.type || "Resource",
            url: resource?.url,
            duration: resource?.duration || "Self-paced",
            priority: (resource?.priority as LearningResource["priority"]) || "recommended"
          } as LearningResource;
        });
      });

  const learningPath = roadmap.map((phase: any) => ({
    phase: typeof phase?.phase === "number"
      ? `Phase ${phase.phase}${phase?.title ? `: ${phase.title}` : ""}`
      : phase?.title || phase?.phase || "Phase",
    duration: phase?.duration || "Varies",
    skills: Array.isArray(phase?.skills) ? phase.skills : [],
    milestones: Array.isArray(phase?.milestones) ? phase.milestones : []
  }));

  return {
    overallReadiness: typeof analysis?.matchPercentage === "number" ? analysis.matchPercentage : 50,
    skillGaps,
    strengths: transferableSkills,
    learningPath,
    resources,
    estimatedTimeToGoal: analysis?.estimatedTimeToGoal || analysis?.timeline || "6 months",
    quickWins: Array.isArray(analysis?.quickWins) ? analysis.quickWins : [],
    recommendations: tips
  };
};

export default function SkillsGapPage() {
  const [step, setStep] = useState<"input" | "results">("input");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const [formData, setFormData] = useState({
    currentSkills: "",
    skillLevels: {} as Record<string, number>,
    targetRole: "",
    targetLevel: "mid",
    currentRole: "",
    yearsExperience: "",
    learningHoursPerWeek: "5",
    learningPreference: [] as string[]
  });

  const experienceLevels = [
    { value: "entry", label: "Entry Level / Junior" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior Level" },
    { value: "lead", label: "Lead / Principal" },
    { value: "manager", label: "Manager / Director" }
  ];

  const learningPreferences = [
    "Online Courses",
    "Video Tutorials",
    "Reading Documentation",
    "Hands-on Projects",
    "Mentorship",
    "Bootcamps"
  ];

  const handlePreferenceToggle = (pref: string) => {
    setFormData({
      ...formData,
      learningPreference: formData.learningPreference.includes(pref)
        ? formData.learningPreference.filter(p => p !== pref)
        : [...formData.learningPreference, pref]
    });
  };

  const analyzeGap = async () => {
    if (!formData.currentSkills || !formData.targetRole) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/skills-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSkills: formData.currentSkills.split(",").map(s => s.trim()),
          targetRole: formData.targetRole,
          targetLevel: formData.targetLevel,
          currentRole: formData.currentRole,
          yearsExperience: formData.yearsExperience,
          learningHoursPerWeek: parseInt(formData.learningHoursPerWeek) || 5,
          learningPreference: formData.learningPreference
        })
      });

      const data = await response.json();
      if (data.success) {
        const analysis = data.analysis || data;
        setResults(normalizeAnalysis(analysis));
        setStep("results");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error analyzing skills gap:", error);
      alert("Failed to analyze skills gap. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "low": return "text-green-500 bg-green-500/10";
      case "essential": return "text-red-500 bg-red-500/10";
      case "recommended": return "text-yellow-500 bg-yellow-500/10";
      default: return "text-green-500 bg-green-500/10";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 pb-20">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-foreground mb-2">
          <span className="text-primary">AI</span> Skills Gap Analysis
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover your career growth path with personalized learning roadmap
        </p>
      </div>

      {/* Step 1: Input */}
      {step === "input" && (
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50">
          <div className="space-y-6">
            {/* Current Situation */}
            <div className="border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Briefcase size={20} className="text-primary" />
                Your Current Situation
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current Role</label>
              <input
                type="text"
                value={formData.currentRole}
                onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-sm"
                placeholder="Student, Junior Dev, QA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Current Skills *</label>
              <textarea
                value={formData.currentSkills}
                onChange={(e) => setFormData({ ...formData, currentSkills: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all resize-none placeholder:text-sm"
                placeholder="HTML, CSS, JS, React, Git, Python"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separate skills with commas. Be honest about your current level!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <select
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="">Select...</option>
                  <option value="0">None (Starting fresh)</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-2">1-2 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Learning Hours Per Week</label>
                <select
                  value={formData.learningHoursPerWeek}
                  onChange={(e) => setFormData({ ...formData, learningHoursPerWeek: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="2">2 hours (Light)</option>
                  <option value="5">5 hours (Moderate)</option>
                  <option value="10">10 hours (Dedicated)</option>
                  <option value="20">20 hours (Intensive)</option>
                  <option value="40">40+ hours (Full-time)</option>
                </select>
              </div>
            </div>

            {/* Career Goal */}
            <div className="border-b border-border pb-4 mb-4 pt-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Target size={20} className="text-primary" />
                Your Career Goal
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Role *</label>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-sm"
                  placeholder="Full Stack Dev, Data Scientist"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Level *</label>
                <select
                  value={formData.targetLevel}
                  onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Learning Preferences (Optional)</label>
              <div className="flex flex-wrap gap-2">
                {learningPreferences.map((pref) => (
                  <button
                    key={pref}
                    onClick={() => handlePreferenceToggle(pref)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.learningPreference.includes(pref)
                        ? "bg-primary text-primary-foreground"
                        : "border border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={analyzeGap}
            disabled={!formData.currentSkills || !formData.targetRole || isAnalyzing}
            className="w-full mt-8 py-4 bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Analyzing Your Skills...
              </>
            ) : (
              <>
                <TrendingUp size={24} />
                Analyze My Skills Gap
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Results */}
      {step === "results" && results && (
        <div className="space-y-6">
          {/* Overall Readiness */}
          <div className="glass-card rounded-2xl p-8 border border-border/50 text-center">
            <div className="relative w-40 h-40 mx-auto mb-4">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-accent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(results.overallReadiness / 100) * 440} 440`}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-foreground">{results.overallReadiness}%</span>
                <span className="text-sm text-muted-foreground">Ready</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Career Readiness for {formData.targetRole}
            </h2>
            <p className="text-muted-foreground mt-2">
              Estimated time to goal: <span className="font-medium text-primary">{results.estimatedTimeToGoal}</span>
            </p>
            <button
              onClick={() => setStep("input")}
              className="mt-4 text-sm text-primary hover:underline"
            >
              ← Update my profile
            </button>
          </div>

          {/* Quick Wins */}
          {results.quickWins && results.quickWins.length > 0 && (
            <div className="glass-card rounded-xl p-6 border border-green-500/30 bg-green-500/5">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                Quick Wins (Start Here!)
              </h3>
              <ul className="space-y-2">
                {results.quickWins.map((win, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground">
                    <ChevronRight size={16} className="text-green-500 mt-1 shrink-0" />
                    {win}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                Your Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.strengths.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills to Develop */}
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-yellow-500" />
                Skills to Develop
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {results.skillGaps.map((gap, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(gap.priority)}`}>
                        {gap.priority}
                      </span>
                      <span className="text-foreground">{gap.skill}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{gap.timeToLearn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Gap Visualization */}
          {results.skillGaps && results.skillGaps.length > 0 && (
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Skills Gap Breakdown
              </h3>
              <div className="space-y-4">
                {results.skillGaps.slice(0, 8).map((gap, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{gap.skill}</span>
                      <span className="text-muted-foreground">
                        {gap.currentLevel}/10 → {gap.requiredLevel}/10
                      </span>
                    </div>
                    <div className="h-3 bg-accent rounded-full overflow-hidden relative">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary/30 rounded-full transition-all"
                        style={{ width: `${(gap.requiredLevel / 10) * 100}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
                        style={{ width: `${(gap.currentLevel / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Path */}
          {results.learningPath && results.learningPath.length > 0 && (
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
                <Layers size={20} className="text-primary" />
                Your Personalized Learning Path
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-8">
                  {results.learningPath.map((phase, idx) => (
                    <div key={idx} className="relative pl-12">
                      {/* Timeline dot */}
                      <div className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                        idx === 0 ? "bg-primary border-primary" : "bg-background border-border"
                      } flex items-center justify-center`}>
                        <span className="text-xs font-bold">{idx + 1}</span>
                      </div>

                      <div className="glass-card rounded-lg p-4 border border-border/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                          <h4 className="font-bold text-foreground">{phase.phase}</h4>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock size={14} /> {phase.duration}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Skills to Learn:</p>
                          <div className="flex flex-wrap gap-1">
                            {phase.skills.map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {phase.milestones && phase.milestones.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Milestones:</p>
                            <ul className="space-y-1">
                              {phase.milestones.map((milestone, i) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                  <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                                  {milestone}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Learning Resources */}
          {results.resources && results.resources.length > 0 && (
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-primary" />
                Recommended Learning Resources
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {results.resources.map((resource, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-foreground">{resource.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${getPriorityColor(resource.priority)}`}>
                        {resource.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="px-2 py-0.5 bg-accent rounded">{resource.type}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {resource.duration}
                      </span>
                    </div>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Open Resource <ArrowRight size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <Link
                href="/courses"
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <BookOpen size={18} />
                Browse Our Courses
              </Link>
            </div>
          )}

          {/* AI Recommendations */}
          {results.recommendations && results.recommendations.length > 0 && (
            <div className="glass-card rounded-xl p-6 border border-primary/30 bg-primary/5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                AI Career Recommendations
              </h3>
              <ul className="space-y-3">
                {results.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-foreground">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                      {idx + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen size={18} /> Start Learning
            </Link>
            <Link
              href="/ai-tools/job-matcher"
              className="px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
            >
              <Target size={18} /> Find Matching Jobs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
