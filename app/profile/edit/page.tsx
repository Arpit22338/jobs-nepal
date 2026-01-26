"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AvatarUpload from "@/components/AvatarUpload";

// Types
interface Education {
  level: string;
  field: string;
  institution: string;
  year: string;
}

interface WorkExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Skill {
  name: string;
  level: number;
}

interface BioVariations {
  professional: string;
  casual: string;
  creative: string;
}

interface ProfileFormData {
  image: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  dob: string;
  gender: string;
  jobTitle: string;
  company: string;
  bio: string;
  skills: Skill[];
  yearsExperience: string;
  expertiseAreas: string[];
  education: Education[];
  workExperience: WorkExperience[];
  linkedinUrl: string;
  noLinkedin: boolean;
  githubUrl: string;
  noGithub: boolean;
  portfolioUrl: string;
  noPortfolio: boolean;
  twitterUrl: string;
  noTwitter: boolean;
  otherLinks: string;
  preferredIndustries: string[];
  preferredJobTypes: string[];
  openToRemote: boolean;
  willingToRelocate: boolean;
  emailNotifications: boolean;
  jobAlerts: boolean;
  privacyLevel: string;
}

const defaultFormData: ProfileFormData = {
  image: "",
  name: "",
  email: "",
  phone: "",
  location: "",
  dob: "",
  gender: "",
  jobTitle: "",
  company: "",
  bio: "",
  skills: [],
  yearsExperience: "",
  expertiseAreas: [],
  education: [{ level: "", field: "", institution: "", year: "" }],
  workExperience: [],
  linkedinUrl: "",
  noLinkedin: false,
  githubUrl: "",
  noGithub: false,
  portfolioUrl: "",
  noPortfolio: false,
  twitterUrl: "",
  noTwitter: false,
  otherLinks: "",
  preferredIndustries: [],
  preferredJobTypes: [],
  openToRemote: false,
  willingToRelocate: false,
  emailNotifications: true,
  jobAlerts: true,
  privacyLevel: "public",
};

const yearsOptions = ["0-1", "1-2", "2-5", "5-10", "10-15", "15-20", "20+"];
const educationLevels = ["HS", "BA", "MA", "PhD", "Oth"];
const industries = ["Tech", "Health", "Fin", "Edu", "Creative", "Mkt", "Mfg", "Retail", "Hosp", "Const", "Oth"];
const jobTypes = ["FT", "PT", "Cont", "Free", "Intern"];
const commonSkills = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "SQL", "MongoDB", "AWS", "Docker", "Git", "CSS", "HTML", "Figma", "Photoshop", "Excel", "Communication", "Leadership", "Project Management"];

const aiLoadingMessages = [
  { text: "Analyzing your profile...", duration: 1500 },
  { text: "Crafting your bio...", duration: 2000 },
  { text: "Creating variations...", duration: 1500 }
];

// Employer form data
interface EmployerFormData {
  image: string;
  companyName: string;
  description: string;
  location: string;
  website: string;
  portfolioUrl: string;
  emailNotifications: boolean;
  privacyLevel: string;
}

const defaultEmployerData: EmployerFormData = {
  image: "",
  companyName: "",
  description: "",
  location: "",
  website: "",
  portfolioUrl: "",
  emailNotifications: true,
  privacyLevel: "public",
};

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Job Seeker form data
  const [formData, setFormData] = useState<ProfileFormData>(defaultFormData);
  // Employer form data
  const [employerData, setEmployerData] = useState<EmployerFormData>(defaultEmployerData);
  
  const role = session?.user?.role;
  
  // UI State
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    professional: true,
    skills: true,
    education: false,
    experience: false,
    social: false,
    preferences: false,
    settings: false,
  });
  
  // Skills
  const [skillInput, setSkillInput] = useState("");
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState("");
  
  // AI Bio Generator
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState(0);
  const [bioVariations, setBioVariations] = useState<BioVariations | null>(null);
  const [selectedBioStyle, setSelectedBioStyle] = useState<"professional" | "casual" | "creative">("professional");
  const [customAiData, setCustomAiData] = useState({
    name: "",
    title: "",
    skills: [] as string[],
    experience: "",
    achievement: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        
        if (role === "EMPLOYER" && data.profile) {
          setEmployerData({
            image: data.profile.image || "",
            companyName: data.profile.companyName || "",
            description: data.profile.description || "",
            location: data.profile.location || "",
            website: data.profile.website || "",
            portfolioUrl: data.profile.portfolioUrl || "",
            emailNotifications: true,
            privacyLevel: "public",
          });
        } else if (data.profile) {
          // Parse skills
          let parsedSkills: Skill[] = [];
          if (data.profile.skills) {
            try {
              const parsed = JSON.parse(data.profile.skills);
              if (Array.isArray(parsed)) {
                parsedSkills = parsed;
              }
            } catch {
              parsedSkills = data.profile.skills.split(",").map((s: string) => ({
                name: s.trim(),
                level: 50
              })).filter((s: Skill) => s.name);
            }
          }
          
          // Parse extended data if exists
          let extendedData: any = {};
          try {
            if (data.profile.metadata) {
              extendedData = JSON.parse(data.profile.metadata);
            }
          } catch { /* ignore */ }
          
          setFormData({
            ...defaultFormData,
            image: data.profile.image || "",
            name: session?.user?.name || "",
            email: session?.user?.email || "",
            phone: extendedData.phone || "",
            location: data.profile.location || "",
            dob: extendedData.dob || "",
            gender: extendedData.gender || "",
            jobTitle: extendedData.jobTitle || "",
            company: extendedData.company || "",
            bio: data.profile.bio || "",
            skills: parsedSkills,
            yearsExperience: extendedData.yearsExperience || "",
            expertiseAreas: extendedData.expertiseAreas || [],
            education: extendedData.education || [{ level: "", field: "", institution: "", year: "" }],
            workExperience: extendedData.workExperience || [],
            linkedinUrl: extendedData.linkedinUrl || "",
            githubUrl: extendedData.githubUrl || "",
            portfolioUrl: data.profile.portfolioUrl || "",
            twitterUrl: extendedData.twitterUrl || "",
            otherLinks: extendedData.otherLinks || "",
            preferredIndustries: extendedData.preferredIndustries || [],
            preferredJobTypes: extendedData.preferredJobTypes || [],
            openToRemote: extendedData.openToRemote || false,
            willingToRelocate: extendedData.willingToRelocate || false,
            emailNotifications: extendedData.emailNotifications !== false,
            jobAlerts: extendedData.jobAlerts !== false,
            privacyLevel: extendedData.privacyLevel || "public",
          });
          
          // Pre-fill AI data
          setCustomAiData({
            name: session?.user?.name || "",
            title: extendedData.jobTitle || "",
            skills: parsedSkills.map(s => s.name).slice(0, 5),
            experience: extendedData.yearsExperience || "",
            achievement: ""
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setLoading(false);
      }
    };

    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router, session, role]);

  const updateField = <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const updateEmployerField = <K extends keyof EmployerFormData>(field: K, value: EmployerFormData[K]) => {
    setEmployerData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Skills management
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.find(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      updateField("skills", [...formData.skills, { name: trimmed, level: 50 }]);
    }
    setSkillInput("");
    setShowSkillSuggestions(false);
  };

  const removeSkill = (skillName: string) => {
    updateField("skills", formData.skills.filter(s => s.name !== skillName));
  };

  const updateSkillLevel = (skillName: string, level: number) => {
    updateField("skills", formData.skills.map(s => s.name === skillName ? { ...s, level } : s));
  };

  const addExpertise = (expertise: string) => {
    const trimmed = expertise.trim();
    if (trimmed && !formData.expertiseAreas.includes(trimmed)) {
      updateField("expertiseAreas", [...formData.expertiseAreas, trimmed]);
    }
    setExpertiseInput("");
  };

  const removeExpertise = (expertise: string) => {
    updateField("expertiseAreas", formData.expertiseAreas.filter(e => e !== expertise));
  };

  // Education management
  const addEducation = () => {
    updateField("education", [...formData.education, { level: "", field: "", institution: "", year: "" }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: value };
    updateField("education", updated);
  };

  const removeEducation = (index: number) => {
    if (formData.education.length > 1) {
      updateField("education", formData.education.filter((_, i) => i !== index));
    }
  };

  // Work experience management
  const addWorkExperience = () => {
    updateField("workExperience", [...formData.workExperience, { title: "", company: "", startDate: "", endDate: "", current: false, description: "" }]);
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string | boolean) => {
    const updated = [...formData.workExperience];
    updated[index] = { ...updated[index], [field]: value };
    updateField("workExperience", updated);
  };

  const removeWorkExperience = (index: number) => {
    updateField("workExperience", formData.workExperience.filter((_, i) => i !== index));
  };

  // Industry & job type toggles
  const toggleIndustry = (industry: string) => {
    if (formData.preferredIndustries.includes(industry)) {
      updateField("preferredIndustries", formData.preferredIndustries.filter(i => i !== industry));
    } else if (formData.preferredIndustries.length < 3) {
      updateField("preferredIndustries", [...formData.preferredIndustries, industry]);
    }
  };

  const toggleJobType = (type: string) => {
    if (formData.preferredJobTypes.includes(type)) {
      updateField("preferredJobTypes", formData.preferredJobTypes.filter(t => t !== type));
    } else {
      updateField("preferredJobTypes", [...formData.preferredJobTypes, type]);
    }
  };

  // AI Bio Generation
  const generateBioWithAI = async () => {
    setIsGeneratingBio(true);
    setAiLoadingStep(0);
    setBioVariations(null);

    for (let i = 0; i < aiLoadingMessages.length; i++) {
      setAiLoadingStep(i);
      await new Promise(resolve => setTimeout(resolve, aiLoadingMessages[i].duration));
    }

    try {
      const payload = {
        mode: "custom",
        style: selectedBioStyle,
        manualData: {
          name: customAiData.name || formData.name,
          title: customAiData.title || formData.jobTitle,
          skills: customAiData.skills.length > 0 ? customAiData.skills : formData.skills.map(s => s.name).slice(0, 5),
          experience: customAiData.experience || formData.yearsExperience,
          achievement: customAiData.achievement,
          industry: formData.preferredIndustries[0] || ""
        }
      };

      const response = await fetch("/api/ai/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success && data.bios) {
        setBioVariations(data.bios);
      } else {
        throw new Error(data.error || "Failed to generate bio");
      }
    } catch (error) {
      console.error("Error generating bio:", error);
      alert("Failed to generate bio. Please try again.");
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const selectBioVariation = (style: "professional" | "casual" | "creative") => {
    if (bioVariations) {
      updateField("bio", bioVariations[style]);
      setShowAIModal(false);
      setBioVariations(null);
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (role === "JOBSEEKER") {
      if (!formData.image) newErrors.image = "Profile picture is required (max 1MB).";
      if (!formData.location.trim()) newErrors.location = "Location is required";
      if (formData.skills.length < 2) newErrors.skills = "At least 2 skills required";
    } else {
      if (!employerData.image) newErrors.image = "Profile picture is required (max 1MB).";
      if (!employerData.companyName.trim()) newErrors.companyName = "Company name is required";
      if (!employerData.location.trim()) newErrors.location = "Location is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      document.querySelector(".border-red-500")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSaving(true);
    try {
      let submitData: any;
      
      if (role === "EMPLOYER") {
        submitData = {
          image: employerData.image,
          companyName: employerData.companyName,
          description: employerData.description,
          location: employerData.location,
          website: employerData.website,
          portfolioUrl: employerData.portfolioUrl,
        };
      } else {
        // Extended metadata for job seeker
        const metadata = {
          phone: formData.phone,
          dob: formData.dob,
          gender: formData.gender, // M, F, O
          jobTitle: formData.jobTitle,
          company: formData.company,
          yearsExperience: formData.yearsExperience,
          expertiseAreas: formData.expertiseAreas,
          education: formData.education,
          workExperience: formData.workExperience,
          linkedinUrl: formData.noLinkedin ? null : formData.linkedinUrl,
          githubUrl: formData.noGithub ? null : formData.githubUrl,
          twitterUrl: formData.noTwitter ? null : formData.twitterUrl,
          otherLinks: formData.otherLinks,
          preferredIndustries: formData.preferredIndustries,
          preferredJobTypes: formData.preferredJobTypes,
          openToRemote: formData.openToRemote,
          willingToRelocate: formData.willingToRelocate,
          emailNotifications: formData.emailNotifications,
          jobAlerts: formData.jobAlerts,
          privacyLevel: formData.privacyLevel,
        };
        
        submitData = {
          image: formData.image,
          bio: formData.bio,
          skills: JSON.stringify(formData.skills),
          location: formData.location,
          experience: formData.yearsExperience,
          education: formData.education[0]?.level || "",
          portfolioUrl: formData.noPortfolio ? "" : formData.portfolioUrl,
          metadata: JSON.stringify(metadata),
        };
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errorData = await res.json();
        alert(`Failed to update profile: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const filteredSkillSuggestions = commonSkills.filter(s => 
    s.toLowerCase().includes(skillInput.toLowerCase()) && !formData.skills.find(sk => sk.name.toLowerCase() === s.toLowerCase())
  ).slice(0, 6);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Employer Profile Edit
  if (role === "EMPLOYER") {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 pb-32">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">Edit Company Profile</h1>
          <p className="text-muted-foreground">Update your company information</p>
        </div>

        <div className="space-y-6">
          {/* Company Logo */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <i className="bx bx-building text-primary text-xl"></i> Company Logo
            </h2>
            <div className="flex flex-col items-center">
              <AvatarUpload
                currentImage={employerData.image || undefined}
                onImageChange={(base64) => updateEmployerField("image", base64)}
              />
              {errors.image && (
                <p className="mt-2 text-sm text-red-500">{errors.image}</p>
              )}
            </div>
          </section>

          {/* Company Info */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <i className="bx bx-info-circle text-primary text-xl"></i> Company Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company Name <span className="text-red-500">*</span></label>
              <input type="text" value={employerData.companyName} onChange={(e) => updateEmployerField("companyName", e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.companyName ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50`} />
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea value={employerData.description} onChange={(e) => updateEmployerField("description", e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Tell candidates about your company..." />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location <span className="text-red-500">*</span></label>
                <input type="text" value={employerData.location} onChange={(e) => updateEmployerField("location", e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.location ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                <input type="url" value={employerData.website} onChange={(e) => updateEmployerField("website", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" placeholder="https://yourcompany.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Portfolio/Deck URL</label>
              <input type="url" value={employerData.portfolioUrl} onChange={(e) => updateEmployerField("portfolioUrl", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" placeholder="https://drive.google.com/..." />
            </div>
          </section>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Link href="/profile" className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-accent transition-colors">Cancel</Link>
            <div className="flex gap-3">
              {saveSuccess && <span className="text-green-500 flex items-center gap-1"><i className="bx bx-check-circle"></i> Saved!</span>}
              <button type="button" onClick={handleSubmit} disabled={saving} className="px-8 py-3 rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center gap-2">
                {saving ? <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Saving...</> : <><i className="bx bx-save"></i> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Job Seeker Profile Edit
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">Edit Profile</h1>
        <p className="text-muted-foreground">Keep your profile updated to attract employers</p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("personal")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><i className="bx bx-user text-primary text-xl"></i></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Personal Information</h2><p className="text-sm text-muted-foreground">Your basic details</p></div>
            </div>
            <i className={`bx ${expandedSections.personal ? "bx-chevron-up" : "bx-chevron-down"} text-2xl`}></i>
          </button>
          {expandedSections.personal && (
            <div className="p-6 pt-0 space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-4">
                <AvatarUpload currentImage={formData.image || undefined} onImageChange={(base64) => updateField("image", base64)} />
                {errors.image && (
                  <p className="mt-2 text-sm text-red-500">{errors.image}</p>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => updateField("name", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input type="email" value={formData.email} readOnly className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" placeholder="+977 98XXXXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Location <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.location} onChange={(e) => updateField("location", e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.location ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50`} placeholder="Kathmandu, Nepal" />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Date of Birth</label>
                  <input type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
                  <div className="flex gap-3">
                    {[{ val: "M", label: "Male" }, { val: "F", label: "Female" }, { val: "O", label: "Other" }].map(g => (
                      <button key={g.val} type="button" onClick={() => updateField("gender", g.val)} className={`flex-1 py-2 px-4 rounded-xl border transition-all ${formData.gender === g.val ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>{g.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Professional Information */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("professional")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><i className="bx bx-briefcase text-primary text-xl"></i></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Professional Information</h2><p className="text-sm text-muted-foreground">Your career details</p></div>
            </div>
            <i className={`bx ${expandedSections.professional ? "bx-chevron-up" : "bx-chevron-down"} text-2xl`}></i>
          </button>
          {expandedSections.professional && (
            <div className="p-6 pt-0 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current Job Title</label>
                  <input type="text" value={formData.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" placeholder="e.g. Senior Software Engineer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current Company</label>
                  <input type="text" value={formData.company} onChange={(e) => updateField("company", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" placeholder="Company name" />
                </div>
              </div>
              
              {/* Professional Bio with AI Generator */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-foreground">Professional Bio <span className="text-muted-foreground text-xs">({formData.bio.length}/500)</span></label>
                  <button type="button" onClick={() => setShowAIModal(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-linear-to-r from-primary to-primary/80 text-primary-foreground rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">
                    <i className="bx bx-star text-sm"></i> Generate with AI
                  </button>
                </div>
                <textarea value={formData.bio} onChange={(e) => updateField("bio", e.target.value.slice(0, 500))} rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Tell employers about yourself, your experience, and what makes you unique..." />
              </div>
            </div>
          )}
        </section>

        {/* Skills & Expertise */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("skills")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><i className="bx bx-code-alt text-primary text-xl"></i></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Skills & Expertise</h2><p className="text-sm text-muted-foreground">Your abilities and specialties</p></div>
            </div>
            <i className={`bx ${expandedSections.skills ? "bx-chevron-up" : "bx-chevron-down"} text-2xl`}></i>
          </button>
          {expandedSections.skills && (
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Skills <span className="text-red-500">*</span><span className="text-muted-foreground text-xs ml-2">({formData.skills.length} added)</span></label>
                <div className="relative">
                  <input type="text" value={skillInput} onChange={(e) => { setSkillInput(e.target.value); setShowSkillSuggestions(true); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(skillInput); } }} onFocus={() => setShowSkillSuggestions(true)} onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)} className={`w-full px-4 py-3 rounded-xl border ${errors.skills ? "border-red-500" : "border-border"} bg-background text-foreground focus:ring-2 focus:ring-primary/50`} placeholder="Type a skill and press Enter..." />
                  {showSkillSuggestions && filteredSkillSuggestions.length > 0 && skillInput && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredSkillSuggestions.map(skill => (<button key={skill} type="button" onMouseDown={() => addSkill(skill)} className="w-full px-4 py-2 text-left hover:bg-accent transition-colors text-foreground">{skill}</button>))}
                    </div>
                  )}
                </div>
                {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
              </div>
              
              {/* Skills with proficiency */}
              {formData.skills.length > 0 && (
                <div className="space-y-3">
                  {formData.skills.map(skill => (
                    <div key={skill.name} className="bg-accent/50 p-3 rounded-xl border border-border flex items-center gap-4">
                      <div className="flex-1 font-medium text-foreground">{skill.name}</div>
                      <div className="flex items-center gap-2 w-1/2">
                        <span className="text-xs text-muted-foreground w-8">{skill.level}%</span>
                        <input type="range" min="0" max="100" value={skill.level} onChange={(e) => updateSkillLevel(skill.name, parseInt(e.target.value))} className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
                      </div>
                      <button type="button" onClick={() => removeSkill(skill.name)} className="text-red-500 hover:text-red-700"><i className="bx bx-x text-xl"></i></button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Years of Experience</label>
                <select value={formData.yearsExperience} onChange={(e) => updateField("yearsExperience", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50">
                  <option value="">Select</option>
                  {yearsOptions.map(y => (<option key={y} value={y}>{y} years</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Expertise Areas</label>
                <input type="text" value={expertiseInput} onChange={(e) => setExpertiseInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addExpertise(expertiseInput); } }} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" placeholder="e.g. Frontend Development, UI Design (press Enter)" />
                {formData.expertiseAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.expertiseAreas.map(exp => (<span key={exp} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{exp}<button type="button" onClick={() => removeExpertise(exp)}><i className="bx bx-x"></i></button></span>))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Education */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("education")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><i className="bx bxs-graduation text-primary text-xl"></i></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Education</h2><p className="text-sm text-muted-foreground">Your educational background</p></div>
            </div>
            <i className={`bx ${expandedSections.education ? "bx-chevron-up" : "bx-chevron-down"} text-2xl`}></i>
          </button>
          {expandedSections.education && (
            <div className="p-6 pt-0 space-y-4">
              {formData.education.map((edu, index) => (
                <div key={index} className="p-4 border border-border rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Education {index + 1}</span>
                    {formData.education.length > 1 && (<button type="button" onClick={() => removeEducation(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>)}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Level</label>
                      <select value={edu.level} onChange={(e) => updateEducation(index, "level", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                        <option value="">Select</option>
                        {educationLevels.map(l => (<option key={l} value={l}>{l === "HS" ? "High School" : l === "BA" ? "Bachelor's" : l === "MA" ? "Master's" : l === "PhD" ? "PhD" : "Other"}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Year</label>
                      <input type="text" value={edu.year} onChange={(e) => updateEducation(index, "year", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" placeholder="2020" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Field of Study</label>
                    <input type="text" value={edu.field} onChange={(e) => updateEducation(index, "field", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" placeholder="Computer Science" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Institution</label>
                    <input type="text" value={edu.institution} onChange={(e) => updateEducation(index, "institution", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" placeholder="Tribhuvan University" />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addEducation} className="text-primary hover:underline text-sm flex items-center gap-1"><i className="bx bx-plus"></i> Add Another Education</button>
            </div>
          )}
        </section>

        {/* Work Experience */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("experience")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><i className="bx bx-building text-primary text-xl"></i></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Work Experience</h2><p className="text-sm text-muted-foreground">Your employment history</p></div>
            </div>
            <i className={`bx ${expandedSections.experience ? "bx-chevron-up" : "bx-chevron-down"} text-2xl`}></i>
          </button>
          {expandedSections.experience && (
            <div className="p-6 pt-0 space-y-4">
              {formData.workExperience.length === 0 && (<p className="text-muted-foreground text-sm italic">No work experience added yet.</p>)}
              {formData.workExperience.map((exp, index) => (
                <div key={index} className="p-4 border border-border rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Experience {index + 1}</span>
                    <button type="button" onClick={() => removeWorkExperience(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Job Title</label>
                      <input type="text" value={exp.title} onChange={(e) => updateWorkExperience(index, "title", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Company</label>
                      <input type="text" value={exp.company} onChange={(e) => updateWorkExperience(index, "company", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
                      <input type="month" value={exp.startDate} onChange={(e) => updateWorkExperience(index, "startDate", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">End Date</label>
                      <input type="month" value={exp.endDate} onChange={(e) => updateWorkExperience(index, "endDate", e.target.value)} disabled={exp.current} className={`w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm ${exp.current ? "opacity-50" : ""}`} />
                      <label className="flex items-center gap-2 mt-1">
                        <input type="checkbox" checked={exp.current} onChange={(e) => updateWorkExperience(index, "current", e.target.checked)} className="w-3 h-3" />
                        <span className="text-xs text-muted-foreground">Currently working here</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Description</label>
                    <textarea value={exp.description} onChange={(e) => updateWorkExperience(index, "description", e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none" placeholder="Key responsibilities and achievements..." />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addWorkExperience} className="text-primary hover:underline text-sm flex items-center gap-1"><i className="bx bx-plus"></i> Add Experience</button>
            </div>
          )}
        </section>

        {/* Social Links */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("social")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><i className="bx bx-link text-primary text-xl"></i></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Social Links</h2><p className="text-sm text-muted-foreground">Your online presence</p></div>
            </div>
            <i className={`bx ${expandedSections.social ? "bx-chevron-up" : "bx-chevron-down"} text-2xl`}></i>
          </button>
          {expandedSections.social && (
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2"><i className="bx bxl-linkedin text-blue-600"></i> LinkedIn</label>
                <input type="url" value={formData.linkedinUrl} onChange={(e) => updateField("linkedinUrl", e.target.value)} disabled={formData.noLinkedin} className={`w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 ${formData.noLinkedin ? "opacity-50" : ""}`} placeholder="https://linkedin.com/in/yourname" />
                <label className="flex items-center gap-2 mt-1 cursor-pointer"><input type="checkbox" checked={formData.noLinkedin} onChange={(e) => updateField("noLinkedin", e.target.checked)} className="w-4 h-4" /><span className="text-sm text-muted-foreground">I don&apos;t have LinkedIn</span></label>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2"><i className="bx bxl-github"></i> GitHub</label>
                <input type="url" value={formData.githubUrl} onChange={(e) => updateField("githubUrl", e.target.value)} disabled={formData.noGithub} className={`w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 ${formData.noGithub ? "opacity-50" : ""}`} placeholder="https://github.com/yourname" />
                <label className="flex items-center gap-2 mt-1 cursor-pointer"><input type="checkbox" checked={formData.noGithub} onChange={(e) => updateField("noGithub", e.target.checked)} className="w-4 h-4" /><span className="text-sm text-muted-foreground">I don&apos;t have GitHub</span></label>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2"><i className="bx bx-globe"></i> Portfolio Website</label>
                <input type="url" value={formData.portfolioUrl} onChange={(e) => updateField("portfolioUrl", e.target.value)} disabled={formData.noPortfolio} className={`w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 ${formData.noPortfolio ? "opacity-50" : ""}`} placeholder="https://yourportfolio.com" />
                <label className="flex items-center gap-2 mt-1 cursor-pointer"><input type="checkbox" checked={formData.noPortfolio} onChange={(e) => updateField("noPortfolio", e.target.checked)} className="w-4 h-4" /><span className="text-sm text-muted-foreground">I don&apos;t have a portfolio</span></label>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2"><i className="bx bxl-twitter text-blue-400"></i> Twitter/X</label>
                <input type="url" value={formData.twitterUrl} onChange={(e) => updateField("twitterUrl", e.target.value)} disabled={formData.noTwitter} className={`w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 ${formData.noTwitter ? "opacity-50" : ""}`} placeholder="https://twitter.com/yourname" />
                <label className="flex items-center gap-2 mt-1 cursor-pointer"><input type="checkbox" checked={formData.noTwitter} onChange={(e) => updateField("noTwitter", e.target.checked)} className="w-4 h-4" /><span className="text-sm text-muted-foreground">I don&apos;t have Twitter</span></label>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2"><i className="bx bx-link-alt"></i> Other Links</label>
                <input type="text" value={formData.otherLinks} onChange={(e) => updateField("otherLinks", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" placeholder="Any other relevant links" />
              </div>
            </div>
          )}
        </section>

        {/* Preferences */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("preferences")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><i className="bx bx-slider-alt text-primary text-xl"></i></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Preferences</h2><p className="text-sm text-muted-foreground">Your job preferences</p></div>
            </div>
            <i className={`bx ${expandedSections.preferences ? "bx-chevron-up" : "bx-chevron-down"} text-2xl`}></i>
          </button>
          {expandedSections.preferences && (
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Preferred Industries <span className="text-muted-foreground text-xs">(up to 3)</span></label>
                <div className="flex flex-wrap gap-2">
                  {industries.map(ind => (
                    <button key={ind} type="button" onClick={() => toggleIndustry(ind)} disabled={!formData.preferredIndustries.includes(ind) && formData.preferredIndustries.length >= 3} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.preferredIndustries.includes(ind) ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/80"} ${!formData.preferredIndustries.includes(ind) && formData.preferredIndustries.length >= 3 ? "opacity-50 cursor-not-allowed" : ""}`}>
                      {ind === "Tech" ? "Technology" : ind === "Health" ? "Healthcare" : ind === "Fin" ? "Finance" : ind === "Edu" ? "Education" : ind === "Mkt" ? "Marketing" : ind === "Mfg" ? "Manufacturing" : ind === "Hosp" ? "Hospitality" : ind === "Const" ? "Construction" : ind === "Oth" ? "Other" : ind}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Preferred Job Types</label>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map(type => (
                    <button key={type} type="button" onClick={() => toggleJobType(type)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.preferredJobTypes.includes(type) ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/80"}`}>
                      {type === "FT" ? "Full-time" : type === "PT" ? "Part-time" : type === "Cont" ? "Contract" : type === "Free" ? "Freelance" : "Internship"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-4 rounded-xl border border-border cursor-pointer hover:bg-accent/50 transition-colors">
                  <span className="text-foreground">Open to Remote Work</span>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.openToRemote ? "bg-primary" : "bg-muted"}`} onClick={() => updateField("openToRemote", !formData.openToRemote)}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.openToRemote ? "left-7" : "left-1"}`}></div>
                  </div>
                </label>
                <label className="flex items-center justify-between p-4 rounded-xl border border-border cursor-pointer hover:bg-accent/50 transition-colors">
                  <span className="text-foreground">Willing to Relocate</span>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.willingToRelocate ? "bg-primary" : "bg-muted"}`} onClick={() => updateField("willingToRelocate", !formData.willingToRelocate)}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.willingToRelocate ? "left-7" : "left-1"}`}></div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </section>

        {/* Account Settings */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleSection("settings")} className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><i className="bx bx-cog text-primary text-xl"></i></div>
              <div className="text-left"><h2 className="text-lg font-bold text-foreground">Account Settings</h2><p className="text-sm text-muted-foreground">Notifications and privacy</p></div>
            </div>
            <i className={`bx ${expandedSections.settings ? "bx-chevron-up" : "bx-chevron-down"} text-2xl`}></i>
          </button>
          {expandedSections.settings && (
            <div className="p-6 pt-0 space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl border border-border cursor-pointer hover:bg-accent/50 transition-colors">
                <div><span className="text-foreground font-medium">Email Notifications</span><p className="text-sm text-muted-foreground">Receive updates via email</p></div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.emailNotifications ? "bg-primary" : "bg-muted"}`} onClick={() => updateField("emailNotifications", !formData.emailNotifications)}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.emailNotifications ? "left-7" : "left-1"}`}></div>
                </div>
              </label>
              <label className="flex items-center justify-between p-4 rounded-xl border border-border cursor-pointer hover:bg-accent/50 transition-colors">
                <div><span className="text-foreground font-medium">Job Alerts</span><p className="text-sm text-muted-foreground">Get notified about matching jobs</p></div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.jobAlerts ? "bg-primary" : "bg-muted"}`} onClick={() => updateField("jobAlerts", !formData.jobAlerts)}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.jobAlerts ? "left-7" : "left-1"}`}></div>
                </div>
              </label>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Profile Privacy</label>
                <div className="space-y-2">
                  {[{ val: "pub", label: "Public", desc: "Visible to all employers" }, { val: "priv", label: "Private", desc: "Only visible when you apply" }, { val: "conn", label: "Connections only", desc: "Visible to your connections" }].map(opt => (
                    <label key={opt.val} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.privacyLevel === opt.val ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                      <input type="radio" name="privacy" value={opt.val} checked={formData.privacyLevel === opt.val} onChange={(e) => updateField("privacyLevel", e.target.value)} className="w-4 h-4 text-primary focus:ring-primary" />
                      <div><span className="text-foreground font-medium">{opt.label}</span><p className="text-xs text-muted-foreground">{opt.desc}</p></div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/profile" className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-border text-foreground hover:bg-accent transition-colors text-center">Cancel</Link>
            <Link href={`/profile/${session?.user?.id || ""}`} className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-border text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"><i className="bx bx-show"></i> Preview</Link>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {saveSuccess && <span className="text-green-500 flex items-center gap-1"><i className="bx bx-check-circle"></i> Profile Updated!</span>}
            <button type="button" onClick={handleSubmit} disabled={saving} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Saving...</> : <><i className="bx bx-save"></i> Save Changes</>}
            </button>
          </div>
        </div>
      </div>

      {/* AI Bio Generator Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><i className="bx bx-star text-primary"></i> AI Bio Generator</h2>
              <button onClick={() => { setShowAIModal(false); setBioVariations(null); }} className="p-2 hover:bg-accent rounded-full"><i className="bx bx-x text-2xl"></i></button>
            </div>
            
            <div className="p-6 space-y-6">
              {!bioVariations ? (
                <>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Your Name</label>
                        <input type="text" value={customAiData.name} onChange={(e) => setCustomAiData({ ...customAiData, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Job Title</label>
                        <input type="text" value={customAiData.title} onChange={(e) => setCustomAiData({ ...customAiData, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" placeholder="e.g. Full Stack Developer" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Top Skills (3-5)</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {customAiData.skills.map(skill => (<span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">{skill}<button type="button" onClick={() => setCustomAiData({ ...customAiData, skills: customAiData.skills.filter(s => s !== skill) })}><i className="bx bx-x"></i></button></span>))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.filter(s => !customAiData.skills.includes(s.name)).slice(0, 6).map(skill => (
                          <button key={skill.name} type="button" onClick={() => setCustomAiData({ ...customAiData, skills: [...customAiData.skills, skill.name].slice(0, 5) })} className="px-2 py-1 text-xs bg-accent hover:bg-accent/80 text-foreground rounded-full">+ {skill.name}</button>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Years of Experience</label>
                        <select value={customAiData.experience} onChange={(e) => setCustomAiData({ ...customAiData, experience: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50">
                          <option value="">Select</option>
                          {yearsOptions.map(y => (<option key={y} value={y}>{y} years</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Key Achievement</label>
                        <input type="text" value={customAiData.achievement} onChange={(e) => setCustomAiData({ ...customAiData, achievement: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50" placeholder="One notable achievement" />
                      </div>
                    </div>
                  </div>

                  {/* Bio Style Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bio Style</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: "professional", label: "Professional", desc: "Formal, corporate" },
                        { value: "casual", label: "Casual", desc: "Friendly, approachable" },
                        { value: "creative", label: "Creative", desc: "Unique, personality" }
                      ].map(style => (
                        <button key={style.value} type="button" onClick={() => setSelectedBioStyle(style.value as "professional" | "casual" | "creative")} className={`flex-1 min-w-[100px] p-3 rounded-xl border transition-all text-left ${selectedBioStyle === style.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                          <div className="font-medium text-foreground">{style.label}</div>
                          <div className="text-xs text-muted-foreground">{style.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="button" onClick={generateBioWithAI} disabled={isGeneratingBio || !customAiData.name || !customAiData.title} className="w-full py-3 rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isGeneratingBio ? (<><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>{aiLoadingMessages[aiLoadingStep]?.text || "Generating..."}</>) : (<><i className="bx bx-star"></i> Generate Bio</>)}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-center">Choose a bio variation</p>
                  <div className="space-y-4">
                    {(["professional", "casual", "creative"] as const).map(style => (
                      <div key={style} className={`p-4 rounded-xl border ${selectedBioStyle === style ? "border-primary bg-primary/5" : "border-border"} hover:border-primary/50 transition-all`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-foreground capitalize">{style}</span>
                          <button type="button" onClick={() => selectBioVariation(style)} className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Use This</button>
                        </div>
                        <p className="text-muted-foreground text-sm">{bioVariations[style]}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setBioVariations(null)} className="flex-1 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-1"><i className="bx bx-arrow-back"></i> Back</button>
                    <button type="button" onClick={generateBioWithAI} disabled={isGeneratingBio} className="flex-1 py-2 rounded-lg bg-accent text-foreground hover:bg-accent/80 transition-colors flex items-center justify-center gap-1">
                      {isGeneratingBio ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : <i className="bx bx-refresh"></i>} Try Again
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
