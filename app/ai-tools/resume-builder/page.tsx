"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, Briefcase, GraduationCap, 
  Wrench, FolderOpen, Heart, Award, FileText, Plus, Trash2, ChevronDown, 
  ChevronUp, Sparkles, Download, Image as ImageIcon, Edit3, Check
} from "lucide-react";

// Types
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  noLinkedin: boolean;
  portfolio: string;
  noPortfolio: boolean;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  field: string;
  graduationYear: string;
  gpa: string;
  noGpa: boolean;
  coursework: string;
  achievements: string;
}

interface Language {
  language: string;
  proficiency: string;
}

interface Skills {
  technical: string;
  soft: string;
  languages: Language[];
  tools: string;
  certifications: string;
  noCertifications: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  link: string;
  duration: string;
}

interface Volunteer {
  id: string;
  organization: string;
  role: string;
  duration: string;
  description: string;
}

interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
}

interface ResumeData {
  header: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    field: string;
    graduationYear: string;
    gpa?: string;
    coursework?: string[];
    achievements?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: Array<{ language: string; proficiency: string }>;
    tools: string[];
  };
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications: string[];
  volunteer: Array<{
    organization: string;
    role: string;
    duration: string;
    description: string;
  }>;
  awards: Array<{
    title: string;
    issuer: string;
    date: string;
  }>;
}

// Loading messages
const loadingMessages = [
  "Analyzing your information...",
  "Crafting your professional resume...",
  "Optimizing for ATS systems...",
  "Finalizing your document...",
  "Almost ready..."
];

export default function ResumeBuilderPage() {
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<"wizard" | "single">("wizard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Form state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    noLinkedin: false,
    portfolio: "",
    noPortfolio: false
  });

  const [summary, setSummary] = useState("");
  const [hasWorkExperience, setHasWorkExperience] = useState(true);
  const [experience, setExperience] = useState<Experience[]>([
    { id: "1", title: "", company: "", location: "", startDate: "", endDate: "", current: false, responsibilities: "" }
  ]);

  const [education, setEducation] = useState<Education[]>([
    { id: "1", degree: "", institution: "", field: "", graduationYear: "", gpa: "", noGpa: false, coursework: "", achievements: "" }
  ]);

  const [skills, setSkills] = useState<Skills>({
    technical: "",
    soft: "",
    languages: [{ language: "", proficiency: "Fluent" }],
    tools: "",
    certifications: "",
    noCertifications: false
  });

  const [hasProjects, setHasProjects] = useState(true);
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", title: "", description: "", technologies: "", link: "", duration: "" }
  ]);

  const [hasVolunteer, setHasVolunteer] = useState(false);
  const [volunteer, setVolunteer] = useState<Volunteer[]>([
    { id: "1", organization: "", role: "", duration: "", description: "" }
  ]);

  const [hasAwards, setHasAwards] = useState(false);
  const [awards, setAwards] = useState<AwardItem[]>([
    { id: "1", title: "", issuer: "", date: "" }
  ]);

  const [publications, setPublications] = useState("");
  const [hobbies, setHobbies] = useState("");

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("resumeBuilderData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.personalInfo) setPersonalInfo(parsed.personalInfo);
        if (parsed.summary) setSummary(parsed.summary);
        if (parsed.hasWorkExperience !== undefined) setHasWorkExperience(parsed.hasWorkExperience);
        if (parsed.experience) setExperience(parsed.experience);
        if (parsed.education) setEducation(parsed.education);
        if (parsed.skills) setSkills(parsed.skills);
        if (parsed.hasProjects !== undefined) setHasProjects(parsed.hasProjects);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.hasVolunteer !== undefined) setHasVolunteer(parsed.hasVolunteer);
        if (parsed.volunteer) setVolunteer(parsed.volunteer);
        if (parsed.hasAwards !== undefined) setHasAwards(parsed.hasAwards);
        if (parsed.awards) setAwards(parsed.awards);
        if (parsed.publications) setPublications(parsed.publications);
        if (parsed.hobbies) setHobbies(parsed.hobbies);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    const saveData = () => {
      const data = {
        personalInfo, summary, hasWorkExperience, experience, education, skills,
        hasProjects, projects, hasVolunteer, volunteer, hasAwards, awards,
        publications, hobbies
      };
      localStorage.setItem("resumeBuilderData", JSON.stringify(data));
    };
    
    const interval = setInterval(saveData, 30000);
    return () => clearInterval(interval);
  }, [personalInfo, summary, hasWorkExperience, experience, education, skills, hasProjects, projects, hasVolunteer, volunteer, hasAwards, awards, publications, hobbies]);

  // Loading message animation
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  // Calculate progress
  const calculateProgress = () => {
    let filled = 0;
    let total = 0;
    
    // Personal info (required: name, email, phone, location)
    total += 4;
    if (personalInfo.fullName) filled++;
    if (personalInfo.email) filled++;
    if (personalInfo.phone) filled++;
    if (personalInfo.location) filled++;
    
    // Summary
    total += 1;
    if (summary) filled++;
    
    // Education (at least one complete entry)
    total += 1;
    if (education.some(e => e.degree && e.institution && e.field)) filled++;
    
    // Skills
    total += 1;
    if (skills.technical) filled++;
    
    return Math.round((filled / total) * 100);
  };

  // Add/remove array items
  const addExperience = () => setExperience([...experience, { id: Date.now().toString(), title: "", company: "", location: "", startDate: "", endDate: "", current: false, responsibilities: "" }]);
  const removeExperience = (id: string) => setExperience(experience.filter(e => e.id !== id));
  
  const addEducation = () => setEducation([...education, { id: Date.now().toString(), degree: "", institution: "", field: "", graduationYear: "", gpa: "", noGpa: false, coursework: "", achievements: "" }]);
  const removeEducation = (id: string) => setEducation(education.filter(e => e.id !== id));
  
  const addLanguage = () => setSkills({ ...skills, languages: [...skills.languages, { language: "", proficiency: "Fluent" }] });
  const removeLanguage = (index: number) => setSkills({ ...skills, languages: skills.languages.filter((_, i) => i !== index) });
  
  const addProject = () => setProjects([...projects, { id: Date.now().toString(), title: "", description: "", technologies: "", link: "", duration: "" }]);
  const removeProject = (id: string) => setProjects(projects.filter(p => p.id !== id));
  
  const addVolunteer = () => setVolunteer([...volunteer, { id: Date.now().toString(), organization: "", role: "", duration: "", description: "" }]);
  const removeVolunteer = (id: string) => setVolunteer(volunteer.filter(v => v.id !== id));
  
  const addAward = () => setAwards([...awards, { id: Date.now().toString(), title: "", issuer: "", date: "" }]);
  const removeAward = (id: string) => setAwards(awards.filter(a => a.id !== id));

  // Generate resume
  const handleGenerateResume = async () => {
    setIsGenerating(true);
    setLoadingMessageIndex(0);

    try {
      const response = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo,
          summary,
          hasWorkExperience,
          experience: hasWorkExperience ? experience : [],
          education,
          skills,
          hasProjects,
          projects: hasProjects ? projects : [],
          hasVolunteer,
          volunteer: hasVolunteer ? volunteer : [],
          hasAwards,
          awards: hasAwards ? awards : [],
          publications,
          hobbies
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedResume(data.resume);
        setShowPreview(true);
      } else {
        throw new Error(data.error || "Failed to generate resume");
      }
    } catch (error) {
      console.error("Error generating resume:", error);
      alert("Failed to generate resume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download as PDF
  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;
    
    const canvas = await html2canvas(resumeRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Resume_${personalInfo.fullName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Download as Image
  const downloadImage = async () => {
    if (!resumeRef.current) return;
    
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(resumeRef.current, { scale: 3, useCORS: true });
    
    const link = document.createElement("a");
    link.download = `Resume_${personalInfo.fullName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const steps = [
    { id: 1, title: "Personal", icon: User },
    { id: 2, title: "Experience", icon: Briefcase },
    { id: 3, title: "Education", icon: GraduationCap },
    { id: 4, title: "Skills", icon: Wrench },
    { id: 5, title: "Review", icon: FileText }
  ];

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return personalInfo.fullName && personalInfo.email && personalInfo.phone && personalInfo.location && summary;
      case 2:
        return !hasWorkExperience || experience.some(e => e.title && e.company);
      case 3:
        return education.some(e => e.degree && e.institution && e.field);
      case 4:
        return skills.technical.length > 0;
      default:
        return true;
    }
  };

  // Show preview after generation
  if (showPreview && generatedResume) {
    return (
      <div className="max-w-6xl mx-auto p-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">Your Professional Resume</h1>
            <p className="text-muted-foreground">Review, edit, and download your ATS-optimized resume</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
            >
              <Edit3 size={18} /> Edit Resume
            </button>
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Download size={18} /> Download PDF
            </button>
            <button
              onClick={downloadImage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
            >
              <ImageIcon size={18} /> Download Image
            </button>
          </div>
        </div>

        {/* Resume Preview - ATS-friendly format */}
        <div 
          ref={resumeRef}
          className="bg-white text-black p-12 shadow-2xl mx-auto max-w-[800px] font-['Times_New_Roman',serif]"
          style={{ minHeight: "1100px" }}
        >
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">
              {generatedResume.header?.name || personalInfo.fullName}
            </h1>
            <p className="text-sm">
              {[
                generatedResume.header?.email || personalInfo.email,
                generatedResume.header?.phone || personalInfo.phone,
                generatedResume.header?.location || personalInfo.location
              ].filter(Boolean).join(" | ")}
            </p>
            {(generatedResume.header?.linkedin || generatedResume.header?.portfolio) && (
              <p className="text-sm mt-1">
                {[generatedResume.header.linkedin, generatedResume.header.portfolio].filter(Boolean).join(" | ")}
              </p>
            )}
          </div>

          {/* Summary */}
          {generatedResume.summary && (
            <section className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-black mb-2">Professional Summary</h2>
              <p className="text-sm leading-relaxed">{generatedResume.summary}</p>
            </section>
          )}

          {/* Experience */}
          {generatedResume.experience && generatedResume.experience.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-black mb-2">Professional Experience</h2>
              {generatedResume.experience.map((exp, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold">{exp.title}</h3>
                    <span className="text-sm">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <p className="italic">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                  <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
                    {(Array.isArray(exp.responsibilities) ? exp.responsibilities : [exp.responsibilities]).map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* Projects (if no experience) */}
          {generatedResume.projects && generatedResume.projects.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-black mb-2">Projects</h2>
              {generatedResume.projects.map((proj, idx) => (
                <div key={idx} className="mb-3">
                  <h3 className="font-bold">{proj.title}</h3>
                  <p className="text-sm">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-sm italic">Technologies: {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {generatedResume.education && generatedResume.education.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-black mb-2">Education</h2>
              {generatedResume.education.map((edu, idx) => (
                <div key={idx} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold">{edu.degree} in {edu.field}</h3>
                    <span className="text-sm">{edu.graduationYear}</span>
                  </div>
                  <p className="italic">{edu.institution}</p>
                  {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {generatedResume.skills && (
            <section className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-black mb-2">Skills</h2>
              <div className="text-sm space-y-1">
                {generatedResume.skills.technical && generatedResume.skills.technical.length > 0 && (
                  <p><strong>Technical:</strong> {Array.isArray(generatedResume.skills.technical) ? generatedResume.skills.technical.join(", ") : generatedResume.skills.technical}</p>
                )}
                {generatedResume.skills.soft && generatedResume.skills.soft.length > 0 && (
                  <p><strong>Soft Skills:</strong> {Array.isArray(generatedResume.skills.soft) ? generatedResume.skills.soft.join(", ") : generatedResume.skills.soft}</p>
                )}
                {generatedResume.skills.tools && generatedResume.skills.tools.length > 0 && (
                  <p><strong>Tools:</strong> {Array.isArray(generatedResume.skills.tools) ? generatedResume.skills.tools.join(", ") : generatedResume.skills.tools}</p>
                )}
                {generatedResume.skills.languages && generatedResume.skills.languages.length > 0 && (
                  <p><strong>Languages:</strong> {generatedResume.skills.languages.map(l => `${l.language} (${l.proficiency})`).join(", ")}</p>
                )}
              </div>
            </section>
          )}

          {/* Certifications */}
          {generatedResume.certifications && generatedResume.certifications.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-black mb-2">Certifications</h2>
              <ul className="list-disc ml-6 text-sm">
                {generatedResume.certifications.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Volunteer */}
          {generatedResume.volunteer && generatedResume.volunteer.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-black mb-2">Volunteer Experience</h2>
              {generatedResume.volunteer.map((vol, idx) => (
                <div key={idx} className="mb-3">
                  <h3 className="font-bold">{vol.role} - {vol.organization}</h3>
                  <p className="text-sm italic">{vol.duration}</p>
                  <p className="text-sm">{vol.description}</p>
                </div>
              ))}
            </section>
          )}

          {/* Awards */}
          {generatedResume.awards && generatedResume.awards.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-black mb-2">Awards & Achievements</h2>
              <ul className="list-disc ml-6 text-sm">
                {generatedResume.awards.map((award, idx) => (
                  <li key={idx}>{award.title}{award.issuer ? ` - ${award.issuer}` : ""}{award.date ? ` (${award.date})` : ""}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto text-primary" size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-foreground">{loadingMessages[loadingMessageIndex]}</p>
            <p className="text-muted-foreground">Please wait while we craft your professional resume</p>
          </div>
          <div className="flex justify-center gap-1">
            {loadingMessages.map((_, idx) => (
              <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === loadingMessageIndex ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-20">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-foreground mb-2">
          <span className="text-primary">AI</span> Resume Builder
        </h1>
        <p className="text-muted-foreground text-lg">Create an ATS-optimized professional resume in minutes</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Progress</span>
          <span className="text-sm font-bold text-primary">{calculateProgress()}% Complete</span>
        </div>
        <div className="h-2 bg-accent rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border border-border p-1 bg-accent/30">
          <button
            onClick={() => setViewMode("wizard")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "wizard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Step by Step
          </button>
          <button
            onClick={() => setViewMode("single")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "single" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Full Form
          </button>
        </div>
      </div>

      {/* Wizard Steps */}
      {viewMode === "wizard" && (
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentStep === step.id 
                      ? "bg-primary text-primary-foreground" 
                      : isStepValid(step.id) 
                        ? "bg-primary/10 text-primary" 
                        : "bg-accent text-muted-foreground hover:bg-accent/80"
                  }`}
                >
                  <step.icon size={18} />
                  <span className="hidden md:inline font-medium">{step.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <ChevronDown size={20} className="text-muted-foreground -rotate-90 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50 space-y-8">
        {/* Step 1: Personal Information */}
        {(viewMode === "single" || currentStep === 1) && (
          <section className={viewMode === "wizard" && currentStep !== 1 ? "hidden" : ""}>
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <User className="text-primary" size={24} /> Personal Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Kathmandu, Nepal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={personalInfo.linkedin}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                  disabled={personalInfo.noLinkedin}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
                  placeholder="linkedin.com/in/johndoe"
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={personalInfo.noLinkedin}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, noLinkedin: e.target.checked, linkedin: "" })}
                    className="rounded border-border"
                  />
                  I don&apos;t have this
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Portfolio/Website</label>
                <input
                  type="url"
                  value={personalInfo.portfolio}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })}
                  disabled={personalInfo.noPortfolio}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
                  placeholder="yourportfolio.com"
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={personalInfo.noPortfolio}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, noPortfolio: e.target.checked, portfolio: "" })}
                    className="rounded border-border"
                  />
                  I don&apos;t have this
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">Professional Summary *</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                placeholder="Describe yourself professionally in 2-3 sentences. Highlight your key strengths, experience, and career objectives..."
              />
              <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                <span>Write a compelling summary about yourself</span>
                <span>{summary.length} characters</span>
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Work Experience */}
        {(viewMode === "single" || currentStep === 2) && (
          <section className={viewMode === "wizard" && currentStep !== 2 ? "hidden" : ""}>
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Briefcase className="text-primary" size={24} /> Work Experience
            </h2>

            <label className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-accent/30 border border-border/50 cursor-pointer">
              <input
                type="checkbox"
                checked={!hasWorkExperience}
                onChange={(e) => setHasWorkExperience(!e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <p className="font-medium">I don&apos;t have work experience yet</p>
                <p className="text-sm text-muted-foreground">We&apos;ll highlight your education, skills, and projects instead</p>
              </div>
            </label>

            {hasWorkExperience && (
              <div className="space-y-6">
                {experience.map((exp, idx) => (
                  <div key={exp.id} className="p-4 rounded-lg border border-border/50 bg-accent/10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Experience {idx + 1}</h3>
                      {experience.length > 1 && (
                        <button onClick={() => removeExperience(exp.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Job Title *</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => setExperience(experience.map(x => x.id === exp.id ? { ...x, title: e.target.value } : x))}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Company Name *</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => setExperience(experience.map(x => x.id === exp.id ? { ...x, company: e.target.value } : x))}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                          placeholder="Tech Company"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => setExperience(experience.map(x => x.id === exp.id ? { ...x, location: e.target.value } : x))}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                          placeholder="City, Country"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Start Date *</label>
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => setExperience(experience.map(x => x.id === exp.id ? { ...x, startDate: e.target.value } : x))}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">End Date</label>
                          <input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => setExperience(experience.map(x => x.id === exp.id ? { ...x, endDate: e.target.value } : x))}
                            disabled={exp.current}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => setExperience(experience.map(x => x.id === exp.id ? { ...x, current: e.target.checked, endDate: "" } : x))}
                            className="rounded border-border"
                          />
                          Currently working here
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Responsibilities & Achievements *</label>
                        <textarea
                          value={exp.responsibilities}
                          onChange={(e) => setExperience(experience.map(x => x.id === exp.id ? { ...x, responsibilities: e.target.value } : x))}
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                          placeholder="• Led development of key features&#10;• Improved performance by 40%&#10;• Mentored junior developers"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addExperience}
                  className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add Another Job
                </button>
              </div>
            )}

            {!hasWorkExperience && (
              <div className="p-6 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <p className="text-primary font-medium">No problem! We&apos;ll highlight your education, skills, and projects.</p>
                <p className="text-muted-foreground text-sm mt-1">Make sure to fill in your Projects section below.</p>
              </div>
            )}
          </section>
        )}

        {/* Step 3: Education */}
        {(viewMode === "single" || currentStep === 3) && (
          <section className={viewMode === "wizard" && currentStep !== 3 ? "hidden" : ""}>
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <GraduationCap className="text-primary" size={24} /> Education
            </h2>

            <div className="space-y-6">
              {education.map((edu, idx) => (
                <div key={edu.id} className="p-4 rounded-lg border border-border/50 bg-accent/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Education {idx + 1}</h3>
                    {education.length > 1 && (
                      <button onClick={() => removeEducation(edu.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Degree/Certification *</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => setEducation(education.map(x => x.id === edu.id ? { ...x, degree: e.target.value } : x))}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Bachelor of Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Institution *</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => setEducation(education.map(x => x.id === edu.id ? { ...x, institution: e.target.value } : x))}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Tribhuvan University"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Field of Study *</label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => setEducation(education.map(x => x.id === edu.id ? { ...x, field: e.target.value } : x))}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Graduation Year *</label>
                      <input
                        type="text"
                        value={edu.graduationYear}
                        onChange={(e) => setEducation(education.map(x => x.id === edu.id ? { ...x, graduationYear: e.target.value } : x))}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="2024 (or Expected 2025)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">GPA</label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => setEducation(education.map(x => x.id === edu.id ? { ...x, gpa: e.target.value } : x))}
                        disabled={edu.noGpa}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                        placeholder="3.8/4.0"
                      />
                      <label className="flex items-center gap-2 mt-2 text-sm text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={edu.noGpa}
                          onChange={(e) => setEducation(education.map(x => x.id === edu.id ? { ...x, noGpa: e.target.checked, gpa: "" } : x))}
                          className="rounded border-border"
                        />
                        Don&apos;t include GPA
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Relevant Coursework</label>
                      <input
                        type="text"
                        value={edu.coursework}
                        onChange={(e) => setEducation(education.map(x => x.id === edu.id ? { ...x, coursework: e.target.value } : x))}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Data Structures, Algorithms, Web Development"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Academic Achievements</label>
                      <input
                        type="text"
                        value={edu.achievements}
                        onChange={(e) => setEducation(education.map(x => x.id === edu.id ? { ...x, achievements: e.target.value } : x))}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Dean's List, Scholarship Recipient"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addEducation}
                className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add Another Education
              </button>
            </div>
          </section>
        )}

        {/* Step 4: Skills & Projects */}
        {(viewMode === "single" || currentStep === 4) && (
          <section className={viewMode === "wizard" && currentStep !== 4 ? "hidden" : ""}>
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Wrench className="text-primary" size={24} /> Skills
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Technical Skills *</label>
                <input
                  type="text"
                  value={skills.technical}
                  onChange={(e) => setSkills({ ...skills, technical: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="JavaScript, React, Python, Node.js, SQL"
                />
                <p className="text-sm text-muted-foreground mt-1">Separate skills with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Soft Skills</label>
                <input
                  type="text"
                  value={skills.soft}
                  onChange={(e) => setSkills({ ...skills, soft: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Communication, Leadership, Problem-solving, Teamwork"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tools & Technologies</label>
                <input
                  type="text"
                  value={skills.tools}
                  onChange={(e) => setSkills({ ...skills, tools: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Git, VS Code, Docker, AWS, Figma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Languages</label>
                {skills.languages.map((lang, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => {
                        const newLangs = [...skills.languages];
                        newLangs[idx].language = e.target.value;
                        setSkills({ ...skills, languages: newLangs });
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="English, Nepali"
                    />
                    <select
                      value={lang.proficiency}
                      onChange={(e) => {
                        const newLangs = [...skills.languages];
                        newLangs[idx].proficiency = e.target.value;
                        setSkills({ ...skills, languages: newLangs });
                      }}
                      className="px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      <option value="Native">Native</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Basic">Basic</option>
                    </select>
                    {skills.languages.length > 1 && (
                      <button onClick={() => removeLanguage(idx)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addLanguage}
                  className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
                >
                  <Plus size={16} /> Add Language
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Certifications</label>
                <input
                  type="text"
                  value={skills.certifications}
                  onChange={(e) => setSkills({ ...skills, certifications: e.target.value })}
                  disabled={skills.noCertifications}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                  placeholder="AWS Certified Developer, Google Analytics"
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skills.noCertifications}
                    onChange={(e) => setSkills({ ...skills, noCertifications: e.target.checked, certifications: "" })}
                    className="rounded border-border"
                  />
                  I don&apos;t have any certifications
                </label>
              </div>
            </div>

            {/* Projects Section */}
            <div className="mt-10">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <FolderOpen className="text-primary" size={24} /> Projects
                {!hasWorkExperience && <span className="text-sm font-normal text-primary">(Important for you!)</span>}
              </h2>

              <label className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-accent/30 border border-border/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hasProjects}
                  onChange={(e) => setHasProjects(!e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span>I don&apos;t have any projects to showcase</span>
              </label>

              {hasProjects && (
                <div className="space-y-6">
                  {projects.map((proj, idx) => (
                    <div key={proj.id} className="p-4 rounded-lg border border-border/50 bg-accent/10">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Project {idx + 1}</h3>
                        {projects.length > 1 && (
                          <button onClick={() => removeProject(proj.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Project Title *</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => setProjects(projects.map(x => x.id === proj.id ? { ...x, title: e.target.value } : x))}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="E-commerce Website"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Technologies Used</label>
                          <input
                            type="text"
                            value={proj.technologies}
                            onChange={(e) => setProjects(projects.map(x => x.id === proj.id ? { ...x, technologies: e.target.value } : x))}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="React, Node.js, MongoDB"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Description *</label>
                          <textarea
                            value={proj.description}
                            onChange={(e) => setProjects(projects.map(x => x.id === proj.id ? { ...x, description: e.target.value } : x))}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                            placeholder="Describe what you built, the problem it solves, and its impact..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Link / GitHub</label>
                          <input
                            type="url"
                            value={proj.link}
                            onChange={(e) => setProjects(projects.map(x => x.id === proj.id ? { ...x, link: e.target.value } : x))}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="github.com/username/project"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Duration</label>
                          <input
                            type="text"
                            value={proj.duration}
                            onChange={(e) => setProjects(projects.map(x => x.id === proj.id ? { ...x, duration: e.target.value } : x))}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="3 months"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addProject}
                    className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Add Another Project
                  </button>
                </div>
              )}
            </div>

            {/* Volunteer Work */}
            <div className="mt-10">
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVolunteer}
                  onChange={(e) => setHasVolunteer(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="flex items-center gap-2 font-medium">
                  <Heart size={20} className="text-primary" /> I have volunteer experience
                </span>
              </label>

              {hasVolunteer && (
                <div className="space-y-4 ml-7">
                  {volunteer.map((vol, idx) => (
                    <div key={vol.id} className="p-4 rounded-lg border border-border/50 bg-accent/10">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Volunteer {idx + 1}</h3>
                        {volunteer.length > 1 && (
                          <button onClick={() => removeVolunteer(vol.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" value={vol.organization} onChange={(e) => setVolunteer(volunteer.map(x => x.id === vol.id ? { ...x, organization: e.target.value } : x))} className="px-4 py-2 rounded-lg border border-border bg-background" placeholder="Organization *" />
                        <input type="text" value={vol.role} onChange={(e) => setVolunteer(volunteer.map(x => x.id === vol.id ? { ...x, role: e.target.value } : x))} className="px-4 py-2 rounded-lg border border-border bg-background" placeholder="Role *" />
                        <input type="text" value={vol.duration} onChange={(e) => setVolunteer(volunteer.map(x => x.id === vol.id ? { ...x, duration: e.target.value } : x))} className="px-4 py-2 rounded-lg border border-border bg-background" placeholder="Duration" />
                        <input type="text" value={vol.description} onChange={(e) => setVolunteer(volunteer.map(x => x.id === vol.id ? { ...x, description: e.target.value } : x))} className="px-4 py-2 rounded-lg border border-border bg-background" placeholder="Description" />
                      </div>
                    </div>
                  ))}
                  <button onClick={addVolunteer} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                    <Plus size={16} /> Add Another Volunteer Experience
                  </button>
                </div>
              )}
            </div>

            {/* Awards */}
            <div className="mt-8">
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAwards}
                  onChange={(e) => setHasAwards(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="flex items-center gap-2 font-medium">
                  <Award size={20} className="text-primary" /> I have awards / achievements
                </span>
              </label>

              {hasAwards && (
                <div className="space-y-4 ml-7">
                  {awards.map((award) => (
                    <div key={award.id} className="flex gap-2 items-center">
                      <input type="text" value={award.title} onChange={(e) => setAwards(awards.map(x => x.id === award.id ? { ...x, title: e.target.value } : x))} className="flex-1 px-4 py-2 rounded-lg border border-border bg-background" placeholder="Award/Achievement *" />
                      <input type="text" value={award.issuer} onChange={(e) => setAwards(awards.map(x => x.id === award.id ? { ...x, issuer: e.target.value } : x))} className="w-32 px-4 py-2 rounded-lg border border-border bg-background" placeholder="Issuer" />
                      <input type="text" value={award.date} onChange={(e) => setAwards(awards.map(x => x.id === award.id ? { ...x, date: e.target.value } : x))} className="w-24 px-4 py-2 rounded-lg border border-border bg-background" placeholder="Date" />
                      {awards.length > 1 && (
                        <button onClick={() => removeAward(award.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addAward} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                    <Plus size={16} /> Add Another Award
                  </button>
                </div>
              )}
            </div>

            {/* Additional */}
            <div className="mt-10 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Publications (Optional)</label>
                <textarea
                  value={publications}
                  onChange={(e) => setPublications(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="List any publications, papers, or articles..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hobbies & Interests (Optional)</label>
                <input
                  type="text"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Reading, Photography, Hiking, Chess"
                />
              </div>
            </div>
          </section>
        )}

        {/* Step 5: Review */}
        {(viewMode === "single" || currentStep === 5) && (
          <section className={viewMode === "wizard" && currentStep !== 5 ? "hidden" : ""}>
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <FileText className="text-primary" size={24} /> Review & Generate
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-accent/30 border border-border/50">
                <h3 className="font-semibold mb-2">Summary</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    {personalInfo.fullName ? <Check size={16} className="text-green-500" /> : <span className="w-4 h-4 rounded-full border-2 border-muted-foreground" />}
                    Personal Information: {personalInfo.fullName || "Not completed"}
                  </li>
                  <li className="flex items-center gap-2">
                    {summary ? <Check size={16} className="text-green-500" /> : <span className="w-4 h-4 rounded-full border-2 border-muted-foreground" />}
                    Professional Summary: {summary ? "Completed" : "Not completed"}
                  </li>
                  <li className="flex items-center gap-2">
                    {!hasWorkExperience || experience.some(e => e.title) ? <Check size={16} className="text-green-500" /> : <span className="w-4 h-4 rounded-full border-2 border-muted-foreground" />}
                    Work Experience: {!hasWorkExperience ? "Skipped (no experience)" : experience.filter(e => e.title).length + " entries"}
                  </li>
                  <li className="flex items-center gap-2">
                    {education.some(e => e.degree) ? <Check size={16} className="text-green-500" /> : <span className="w-4 h-4 rounded-full border-2 border-muted-foreground" />}
                    Education: {education.filter(e => e.degree).length} entries
                  </li>
                  <li className="flex items-center gap-2">
                    {skills.technical ? <Check size={16} className="text-green-500" /> : <span className="w-4 h-4 rounded-full border-2 border-muted-foreground" />}
                    Skills: {skills.technical ? "Completed" : "Not completed"}
                  </li>
                  <li className="flex items-center gap-2">
                    {!hasProjects || projects.some(p => p.title) ? <Check size={16} className="text-green-500" /> : <span className="w-4 h-4 rounded-full border-2 border-muted-foreground" />}
                    Projects: {!hasProjects ? "Skipped" : projects.filter(p => p.title).length + " entries"}
                  </li>
                </ul>
              </div>

              <button
                onClick={handleGenerateResume}
                disabled={calculateProgress() < 60}
                className="w-full py-4 bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Sparkles size={24} />
                Generate Professional Resume
              </button>

              {calculateProgress() < 60 && (
                <p className="text-center text-sm text-muted-foreground">
                  Please complete at least 60% of the form to generate your resume
                </p>
              )}
            </div>
          </section>
        )}

        {/* Navigation Buttons (Wizard Mode) */}
        {viewMode === "wizard" && (
          <div className="flex justify-between pt-6 border-t border-border/50">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <ChevronUp className="-rotate-90" size={18} /> Previous
            </button>
            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                Next <ChevronDown className="-rotate-90" size={18} />
              </button>
            ) : (
              <button
                onClick={handleGenerateResume}
                disabled={calculateProgress() < 60}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={18} /> Generate Resume
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
