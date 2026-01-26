"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles, Loader2, X, Check, ChevronDown, ChevronUp,
  Briefcase, MapPin, Clock, GraduationCap, Award,
  Users, Heart, Building2, FileText, Eye, Save, Send,
  Zap, Coffee, Dumbbell, Plane, TrendingUp, Gift
} from "lucide-react";

// Types
interface JobFormData {
  title: string;
  companyName: string;
  department: string;
  industry: string;
  location: string;
  employmentMode: "remote" | "hybrid" | "onsite";
  type: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  hideSalary: boolean;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  education: string;
  yearsExperience: string;
  certifications: string;
  noCertifications: boolean;
  responsibilities: string[];
  benefits: string[];
  customBenefits: string;
  companyCulture: string;
  description: string;
}

const defaultFormData: JobFormData = {
  title: "",
  companyName: "",
  department: "",
  industry: "",
  location: "",
  employmentMode: "onsite",
  type: "",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
  hideSalary: false,
  requiredSkills: [],
  niceToHaveSkills: [],
  education: "",
  yearsExperience: "",
  certifications: "",
  noCertifications: false,
  responsibilities: [""],
  benefits: [],
  customBenefits: "",
  companyCulture: "",
  description: "",
};

const industries = ["Technology", "Healthcare", "Finance", "Education", "Creative Arts", "Sales & Marketing", "Manufacturing", "Retail", "Hospitality", "Construction", "Other"];
const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (2-5 years)" },
  { value: "senior", label: "Senior (5-10 years)" },
  { value: "lead", label: "Lead/Principal (10+ years)" }
];
const educationLevels = ["Not Required", "High School", "Bachelor's Degree", "Master's Degree", "PhD"];
const commonBenefits = [
  { id: "health", label: "Health Insurance", icon: Heart },
  { id: "remote", label: "Remote Work", icon: MapPin },
  { id: "flexible", label: "Flexible Hours", icon: Clock },
  { id: "pto", label: "Paid Time Off", icon: Plane },
  { id: "learning", label: "Professional Development", icon: TrendingUp },
  { id: "gym", label: "Gym Membership", icon: Dumbbell },
  { id: "lunch", label: "Free Lunch", icon: Coffee },
  { id: "stock", label: "Stock Options", icon: Gift },
  { id: "bonus", label: "Bonus/Incentives", icon: Zap }
];
const commonSkills = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "SQL", "MongoDB", "AWS", "Docker", "Git", "CSS", "HTML", "Figma", "Excel", "Communication", "Leadership", "Project Management"];
const aiLoadingMessages = [
  { text: "Analyzing job requirements...", duration: 2000 },
  { text: "Crafting engaging description...", duration: 3000 },
  { text: "Optimizing for candidates...", duration: 2000 },
  { text: "Finalizing description...", duration: 1000 }
];

export default function NewJobPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<JobFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [niceSkillInput, setNiceSkillInput] = useState("");
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true, details: true, requirements: true, responsibilities: true, benefits: true, culture: false, description: true
  });

  useEffect(() => {
    if (session?.user) {
      fetch("/api/profile").then(res => res.json()).then(data => {
        if (data.employerProfile?.companyName) {
          setFormData(prev => ({ ...prev, companyName: data.employerProfile.companyName }));
        }
      }).catch(() => {});
    }
  }, [session]);

  useEffect(() => {
    const draft = localStorage.getItem("jobPostDraft");
    if (draft) {
      try { setFormData({ ...defaultFormData, ...JSON.parse(draft) }); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (formData.title || formData.description) {
        localStorage.setItem("jobPostDraft", JSON.stringify(formData));
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [formData]);

  const updateField = <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addSkill = (skill: string, type: "required" | "nice") => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (type === "required") {
      if (!formData.requiredSkills.includes(trimmed)) updateField("requiredSkills", [...formData.requiredSkills, trimmed]);
      setSkillInput("");
    } else {
      if (!formData.niceToHaveSkills.includes(trimmed)) updateField("niceToHaveSkills", [...formData.niceToHaveSkills, trimmed]);
      setNiceSkillInput("");
    }
    setShowSkillSuggestions(false);
  };

  const removeSkill = (skill: string, type: "required" | "nice") => {
    if (type === "required") updateField("requiredSkills", formData.requiredSkills.filter(s => s !== skill));
    else updateField("niceToHaveSkills", formData.niceToHaveSkills.filter(s => s !== skill));
  };

  const addResponsibility = () => {
    if (formData.responsibilities.length < 10) updateField("responsibilities", [...formData.responsibilities, ""]);
  };

  const updateResponsibility = (index: number, value: string) => {
    const updated = [...formData.responsibilities];
    updated[index] = value;
    updateField("responsibilities", updated);
  };

  const removeResponsibility = (index: number) => {
    if (formData.responsibilities.length > 1) updateField("responsibilities", formData.responsibilities.filter((_, i) => i !== index));
  };

  const toggleBenefit = (benefitId: string) => {
    if (formData.benefits.includes(benefitId)) updateField("benefits", formData.benefits.filter(b => b !== benefitId));
    else updateField("benefits", [...formData.benefits, benefitId]);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.industry) newErrors.industry = "Industry is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.type) newErrors.type = "Job type is required";
    if (!formData.experienceLevel) newErrors.experienceLevel = "Experience level is required";
    if (formData.requiredSkills.length < 3) newErrors.requiredSkills = "At least 3 skills required";
    if (!formData.education) newErrors.education = "Education requirement is required";
    if (!formData.yearsExperience) newErrors.yearsExperience = "Years of experience is required";
    const validResponsibilities = formData.responsibilities.filter(r => r.trim());
    if (validResponsibilities.length < 3) newErrors.responsibilities = "At least 3 responsibilities required";
    if (!formData.description.trim()) newErrors.description = "Job description is required";
    if (formData.description.length < 100) newErrors.description = "Description must be at least 100 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canGenerateAI = (): boolean => {
    return !!(formData.title.trim() && formData.companyName.trim() && formData.industry && formData.location.trim() && formData.type && formData.experienceLevel && formData.requiredSkills.length >= 3 && formData.responsibilities.filter(r => r.trim()).length >= 3);
  };

  const generateWithAI = async () => {
    if (!canGenerateAI()) { alert("Please fill in all required fields before generating with AI"); return; }
    setIsGenerating(true);
    setAiLoadingStep(0);
    for (let i = 0; i < aiLoadingMessages.length; i++) {
      setAiLoadingStep(i);
      await new Promise(resolve => setTimeout(resolve, aiLoadingMessages[i].duration));
    }
    try {
      const response = await fetch("/api/ai/job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title, company: formData.companyName, department: formData.department, industry: formData.industry, location: formData.location, employmentMode: formData.employmentMode, type: formData.type, experienceLevel: formData.experienceLevel,
          salaryRange: formData.salaryMin && formData.salaryMax ? `NPR ${formData.salaryMin} - ${formData.salaryMax}` : null,
          requirements: formData.requiredSkills, niceToHave: formData.niceToHaveSkills, education: formData.education, yearsExperience: formData.yearsExperience, certifications: formData.noCertifications ? null : formData.certifications,
          responsibilities: formData.responsibilities.filter(r => r.trim()), benefits: formData.benefits.map(b => commonBenefits.find(cb => cb.id === b)?.label || b), customBenefits: formData.customBenefits, companyCulture: formData.companyCulture, tone: "professional", includeCompanyBenefits: formData.benefits.length > 0 || !!formData.customBenefits
        }),
      });
      const data = await response.json();
      if (data.success && data.description) updateField("description", data.description);
      else throw new Error(data.error || "Failed to generate description");
    } catch (error) { console.error("Error generating description:", error); alert("Failed to generate description. Please try again."); }
    finally { setIsGenerating(false); }
  };

  const saveDraft = () => { localStorage.setItem("jobPostDraft", JSON.stringify(formData)); alert("Draft saved successfully!"); };

  const handleSubmit = async () => {
    if (!validateForm()) { document.querySelector(".border-red-500")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    setIsSubmitting(true);
    try {
      const jobData = {
        title: formData.title, description: formData.description, location: formData.location, type: formData.type,
        salary: formData.hideSalary ? null : (formData.salaryMin && formData.salaryMax ? `NPR ${formData.salaryMin} - ${formData.salaryMax} / month` : null),
        requiredSkills: formData.requiredSkills.join(", "), companyName: formData.companyName, department: formData.department, industry: formData.industry, employmentMode: formData.employmentMode, experienceLevel: formData.experienceLevel, education: formData.education, yearsExperience: formData.yearsExperience, certifications: formData.noCertifications ? null : formData.certifications, niceToHaveSkills: formData.niceToHaveSkills.join(", "),
        responsibilities: formData.responsibilities.filter(r => r.trim()), benefits: [...formData.benefits.map(b => commonBenefits.find(cb => cb.id === b)?.label || b), ...formData.customBenefits.split(",").map(b => b.trim()).filter(Boolean)], companyCulture: formData.companyCulture
      };
      const res = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(jobData) });
      if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.error || "Failed to post job"); }
      const result = await res.json();
      setCreatedJobId(result.job?.id || result.id);
      localStorage.removeItem("jobPostDraft");
      setShowSuccess(true);
    } catch (error) { console.error(error); alert(error instanceof Error ? error.message : "Something went wrong"); }
    finally { setIsSubmitting(false); }
  };

  const filteredSkillSuggestions = commonSkills.filter(s => s.toLowerCase().includes(skillInput.toLowerCase()) && !formData.requiredSkills.includes(s)).slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">Post a New Job</h1>
        <p className="text-muted-foreground">Fill in the details to attract the best candidates</p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("basic")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 size={20} className="text-primary" /></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Basic Information</h2><p className="text-sm text-muted-foreground">Company and job title details</p></div>
            </div>
            {expandedSections.basic ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.basic && (
            <div className="p-6 pt-0 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Job Title <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.title} onChange={(e) => updateField("title", e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.title ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all`} placeholder="e.g. Senior Software Engineer" />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.companyName} onChange={(e) => updateField("companyName", e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.companyName ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all`} placeholder="Your company name" />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Department/Team <span className="text-muted-foreground text-xs">(Optional)</span></label>
                  <input type="text" value={formData.department} onChange={(e) => updateField("department", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all" placeholder="e.g. Engineering, Marketing" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Industry <span className="text-red-500">*</span></label>
                  <select value={formData.industry} onChange={(e) => updateField("industry", e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.industry ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all`}>
                    <option value="">Select Industry</option>
                    {industries.map(ind => (<option key={ind} value={ind}>{ind}</option>))}
                  </select>
                  {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Job Details */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("details")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Briefcase size={20} className="text-primary" /></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Job Details</h2><p className="text-sm text-muted-foreground">Location, type, and compensation</p></div>
            </div>
            {expandedSections.details ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.details && (
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location <span className="text-red-500">*</span></label>
                <input type="text" value={formData.location} onChange={(e) => updateField("location", e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.location ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all`} placeholder="Kathmandu, Remote, Lalitpur" />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Employment Mode <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "remote", label: "Remote", icon: "bx-home-alt" },
                    { value: "hybrid", label: "Hybrid", icon: "bx-transfer" },
                    { value: "onsite", label: "On-site", icon: "bx-buildings" }
                  ].map(mode => (
                    <button key={mode.value} type="button" onClick={() => updateField("employmentMode", mode.value as "remote" | "hybrid" | "onsite")} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${formData.employmentMode === mode.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>
                      <i className={`bx ${mode.icon} text-lg`}></i><span className="font-medium">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Job Type <span className="text-red-500">*</span></label>
                  <select value={formData.type} onChange={(e) => updateField("type", e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.type ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all`}>
                    <option value="">Select Type</option>
                    {jobTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                  </select>
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Experience Level <span className="text-red-500">*</span></label>
                  <select value={formData.experienceLevel} onChange={(e) => updateField("experienceLevel", e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.experienceLevel ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all`}>
                    <option value="">Select Level</option>
                    {experienceLevels.map(level => (<option key={level.value} value={level.value}>{level.label}</option>))}
                  </select>
                  {errors.experienceLevel && <p className="text-red-500 text-sm mt-1">{errors.experienceLevel}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Salary Range <span className="text-muted-foreground text-xs">(Optional)</span></label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">NPR</span>
                    <input type="text" value={formData.salaryMin} onChange={(e) => updateField("salaryMin", e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Min" />
                  </div>
                  <span className="text-muted-foreground">to</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">NPR</span>
                    <input type="text" value={formData.salaryMax} onChange={(e) => updateField("salaryMax", e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Max" />
                  </div>
                  <span className="text-muted-foreground whitespace-nowrap">/month</span>
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={formData.hideSalary} onChange={(e) => updateField("hideSalary", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-muted-foreground">Don&apos;t display salary publicly</span>
                </label>
              </div>
            </div>
          )}
        </section>

        {/* Requirements */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("requirements")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><GraduationCap size={20} className="text-primary" /></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Job Requirements</h2><p className="text-sm text-muted-foreground">Skills, education, and qualifications</p></div>
            </div>
            {expandedSections.requirements ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.requirements && (
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Required Skills <span className="text-red-500">*</span><span className="text-muted-foreground text-xs ml-2">({formData.requiredSkills.length}/3 minimum)</span></label>
                <div className="relative">
                  <input type="text" value={skillInput} onChange={(e) => { setSkillInput(e.target.value); setShowSkillSuggestions(true); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(skillInput, "required"); } }} onFocus={() => setShowSkillSuggestions(true)} onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)} className={`w-full px-4 py-3 rounded-xl border ${errors.requiredSkills ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all`} placeholder="Type a skill and press Enter..." />
                  {showSkillSuggestions && filteredSkillSuggestions.length > 0 && skillInput && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredSkillSuggestions.map(skill => (<button key={skill} type="button" onMouseDown={() => addSkill(skill, "required")} className="w-full px-4 py-2 text-left hover:bg-accent transition-colors text-foreground">{skill}</button>))}
                    </div>
                  )}
                </div>
                {formData.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.requiredSkills.map(skill => (<span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{skill}<button type="button" onClick={() => removeSkill(skill, "required")} className="hover:bg-primary/20 rounded-full p-0.5"><X size={14} /></button></span>))}
                  </div>
                )}
                {errors.requiredSkills && <p className="text-red-500 text-sm mt-1">{errors.requiredSkills}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nice-to-Have Skills <span className="text-muted-foreground text-xs">(Optional)</span></label>
                <input type="text" value={niceSkillInput} onChange={(e) => setNiceSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(niceSkillInput, "nice"); } }} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Additional skills that are a plus..." />
                {formData.niceToHaveSkills.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">{formData.niceToHaveSkills.map(skill => (<span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-accent text-foreground rounded-full text-sm">{skill}<button type="button" onClick={() => removeSkill(skill, "nice")} className="hover:bg-accent/80 rounded-full p-0.5"><X size={14} /></button></span>))}</div>)}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Education Required <span className="text-red-500">*</span></label>
                  <select value={formData.education} onChange={(e) => updateField("education", e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.education ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all`}>
                    <option value="">Select Education</option>
                    {educationLevels.map(level => (<option key={level} value={level}>{level}</option>))}
                  </select>
                  {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Years of Experience <span className="text-red-500">*</span></label>
                  <select value={formData.yearsExperience} onChange={(e) => updateField("yearsExperience", e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.yearsExperience ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all`}>
                    <option value="">Select Years</option>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "10+"].map(year => (<option key={year} value={year}>{year} {year === 1 ? "year" : "years"}</option>))}
                  </select>
                  {errors.yearsExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsExperience}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Certifications Required <span className="text-muted-foreground text-xs">(Optional)</span></label>
                <input type="text" value={formData.certifications} onChange={(e) => updateField("certifications", e.target.value)} disabled={formData.noCertifications} className={`w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all ${formData.noCertifications ? "opacity-50" : ""}`} placeholder="e.g. AWS Certified, PMP" />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={formData.noCertifications} onChange={(e) => updateField("noCertifications", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-muted-foreground">No certifications required</span>
                </label>
              </div>
            </div>
          )}
        </section>

        {/* Responsibilities */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("responsibilities")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText size={20} className="text-primary" /></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Key Responsibilities</h2><p className="text-sm text-muted-foreground">What the candidate will do</p></div>
            </div>
            {expandedSections.responsibilities ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.responsibilities && (
            <div className="p-6 pt-0 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{formData.responsibilities.filter(r => r.trim()).length}/10 responsibilities added</span>
                {formData.responsibilities.length < 10 && (<button type="button" onClick={addResponsibility} className="text-sm text-primary hover:underline">+ Add another</button>)}
              </div>
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="mt-3 text-muted-foreground">•</span>
                  <input type="text" value={resp} onChange={(e) => updateResponsibility(index, e.target.value)} className={`flex-1 px-4 py-3 rounded-xl border ${errors.responsibilities && index < 3 && !resp.trim() ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all`} placeholder={`Responsibility ${index + 1}`} />
                  {formData.responsibilities.length > 1 && (<button type="button" onClick={() => removeResponsibility(index)} className="mt-3 text-muted-foreground hover:text-red-500 transition-colors"><X size={18} /></button>)}
                </div>
              ))}
              {errors.responsibilities && <p className="text-red-500 text-sm">{errors.responsibilities}</p>}
            </div>
          )}
        </section>

        {/* Benefits */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("benefits")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Gift size={20} className="text-primary" /></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Benefits & Perks</h2><p className="text-sm text-muted-foreground">What you offer to employees</p></div>
            </div>
            {expandedSections.benefits ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.benefits && (
            <div className="p-6 pt-0 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonBenefits.map(benefit => {
                  const Icon = benefit.icon;
                  const isSelected = formData.benefits.includes(benefit.id);
                  return (<button key={benefit.id} type="button" onClick={() => toggleBenefit(benefit.id)} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${isSelected ? "bg-primary/10 border-primary text-primary" : "border-border hover:border-primary/50 text-foreground"}`}><Icon size={18} /><span className="text-sm font-medium">{benefit.label}</span>{isSelected && <Check size={16} className="ml-auto" />}</button>);
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Custom Benefits <span className="text-muted-foreground text-xs">(comma separated)</span></label>
                <input type="text" value={formData.customBenefits} onChange={(e) => updateField("customBenefits", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all" placeholder="e.g. Pet-friendly office, Parking allowance" />
              </div>
            </div>
          )}
        </section>

        {/* Company Culture */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("culture")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users size={20} className="text-primary" /></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Company Culture</h2><p className="text-sm text-muted-foreground">Optional - Tell candidates about your team</p></div>
            </div>
            {expandedSections.culture ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.culture && (
            <div className="p-6 pt-0">
              <textarea value={formData.companyCulture} onChange={(e) => updateField("companyCulture", e.target.value.slice(0, 500))} rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all resize-none" placeholder="Tell candidates about your company culture, values, and what makes your team special..." />
              <div className="text-right text-sm text-muted-foreground mt-1">{formData.companyCulture.length}/500 characters</div>
            </div>
          )}
        </section>

        {/* Job Description */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("description")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Award size={20} className="text-primary" /></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Job Description</h2><p className="text-sm text-muted-foreground">Full description of the role</p></div>
            </div>
            {expandedSections.description ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.description && (
            <div className="p-6 pt-0 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <span className="text-sm text-muted-foreground">{formData.description.length}/5000 characters</span>
                <button type="button" onClick={generateWithAI} disabled={!canGenerateAI() || isGenerating} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${canGenerateAI() && !isGenerating ? "bg-linear-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/30" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                  {isGenerating ? (<><Loader2 className="animate-spin" size={18} />{aiLoadingMessages[aiLoadingStep]?.text || "Generating..."}</>) : (<><Sparkles size={18} />Write with AI</>)}
                </button>
              </div>
              {!canGenerateAI() && (<p className="text-sm text-muted-foreground bg-accent/50 p-3 rounded-lg">💡 Fill in all required fields above (title, company, industry, location, type, experience, 3+ skills, and 3+ responsibilities) to enable AI generation</p>)}
              <textarea value={formData.description} onChange={(e) => updateField("description", e.target.value.slice(0, 5000))} rows={12} className={`w-full px-4 py-3 rounded-xl border ${errors.description ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all resize-none font-mono text-sm`} placeholder="Describe job responsibilities, requirements, benefits, and what makes this opportunity special..." />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              {formData.description && (<button type="button" onClick={generateWithAI} disabled={!canGenerateAI() || isGenerating} className="text-sm text-primary hover:underline flex items-center gap-1"><Sparkles size={14} /> Regenerate with AI</button>)}
            </div>
          )}
        </section>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-3 w-full sm:w-auto">
            <button type="button" onClick={saveDraft} className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-border text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"><Save size={18} /> Save Draft</button>
            <button type="button" onClick={() => setShowPreview(true)} className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-border text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"><Eye size={18} /> Preview</button>
          </div>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting ? (<><Loader2 className="animate-spin" size={20} /> Posting...</>) : (<><Send size={20} /> Post Job</>)}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex justify-between items-center"><h2 className="text-xl font-bold text-foreground">Job Preview</h2><button onClick={() => setShowPreview(false)} className="p-2 hover:bg-accent rounded-full"><X size={20} /></button></div>
            <div className="p-6 space-y-6">
              <div><h1 className="text-2xl font-bold text-foreground">{formData.title || "Job Title"}</h1><p className="text-lg text-muted-foreground">{formData.companyName || "Company Name"}</p></div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{formData.type || "Full-time"}</span>
                <span className="px-3 py-1 bg-accent text-foreground rounded-full text-sm flex items-center gap-1"><MapPin size={14} /> {formData.location || "Location"}</span>
                <span className="px-3 py-1 bg-accent text-foreground rounded-full text-sm flex items-center gap-1">
                  {formData.employmentMode === "remote" ? (
                    <><i className="bx bx-home-alt" /> Remote</>
                  ) : formData.employmentMode === "hybrid" ? (
                    <><i className="bx bx-transfer" /> Hybrid</>
                  ) : (
                    <><i className="bx bx-buildings" /> On-site</>
                  )}
                </span>
                {!formData.hideSalary && formData.salaryMin && formData.salaryMax && (<span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">NPR {formData.salaryMin} - {formData.salaryMax}</span>)}
              </div>
              {formData.requiredSkills.length > 0 && (<div><h3 className="font-bold text-foreground mb-2">Required Skills</h3><div className="flex flex-wrap gap-2">{formData.requiredSkills.map(skill => (<span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{skill}</span>))}</div></div>)}
              {formData.description && (<div><h3 className="font-bold text-foreground mb-2">Description</h3><div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">{formData.description}</div></div>)}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} className="text-green-500" /></div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Job Posted Successfully! 🎉</h2>
            <p className="text-muted-foreground mb-8">Your job is now live and visible to candidates.</p>
            <div className="flex flex-col gap-3">
              {createdJobId && (<Link href={`/jobs/${createdJobId}`} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors text-center">View Job</Link>)}
              <button onClick={() => { setShowSuccess(false); setFormData(defaultFormData); setCreatedJobId(null); }} className="w-full py-3 rounded-xl border border-border text-foreground hover:bg-accent transition-colors">Post Another Job</button>
              <Link href="/employer/dashboard" className="w-full py-3 rounded-xl border border-border text-foreground hover:bg-accent transition-colors block text-center">Go to Dashboard</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
