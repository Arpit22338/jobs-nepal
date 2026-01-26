"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { X, MapPin, Briefcase, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileCompletionModalProps {
    userName: string;
    userEmail: string;
}

const SKILL_OPTIONS = [
    "JavaScript", "Python", "React", "Node.js", "TypeScript",
    "Java", "C++", "SQL", "HTML/CSS", "Next.js",
    "Data Analysis", "Machine Learning", "UI/UX Design",
    "Project Management", "Marketing", "Content Writing",
    "Customer Service", "Sales", "Accounting", "Teaching"
];

export default function ProfileCompletionModal({ userName, userEmail }: ProfileCompletionModalProps) {
    const router = useRouter();
    const { update } = useSession();
    const [skills, setSkills] = useState<string[]>([]);
    const [customSkill, setCustomSkill] = useState("");
    const [location, setLocation] = useState("");
    const [experience, setExperience] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const toggleSkill = (skill: string) => {
        if (skills.includes(skill)) {
            setSkills(skills.filter((s) => s !== skill));
        } else {
            setSkills([...skills, skill]);
        }
    };

    const addCustomSkill = () => {
        if (customSkill.trim() && !skills.includes(customSkill.trim())) {
            setSkills([...skills, customSkill.trim()]);
            setCustomSkill("");
        }
    };

    const handleSubmit = async () => {
        setError("");

        if (skills.length === 0) {
            setError("Please select at least one skill");
            return;
        }
        if (!location.trim()) {
            setError("Please enter your location");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/profile/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skills, location, experience }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save profile");
            }

            // Update session to reflect profile completion
            await update();
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Sparkles className="text-primary" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Complete Your Profile</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Help employers find you by completing your profile
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Auto-filled fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                            <p className="mt-1 text-foreground font-medium">{userName}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                            <p className="mt-1 text-foreground font-medium truncate">{userEmail}</p>
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                            <Briefcase size={12} /> Skills <span className="text-destructive">*</span>
                        </label>
                        <p className="text-xs text-muted-foreground mb-3">Select at least one skill</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {SKILL_OPTIONS.map((skill) => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => toggleSkill(skill)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${skills.includes(skill)
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-secondary-foreground hover:bg-accent"
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customSkill}
                                onChange={(e) => setCustomSkill(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                                placeholder="Add custom skill..."
                                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <Button type="button" variant="secondary" size="sm" onClick={addCustomSkill}>
                                Add
                            </Button>
                        </div>
                        {skills.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {skills.filter(s => !SKILL_OPTIONS.includes(s)).map((skill) => (
                                    <span key={skill} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                        {skill}
                                        <button onClick={() => toggleSkill(skill)} className="hover:text-destructive">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                            <MapPin size={12} /> Location <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Kathmandu, Nepal"
                            className="mt-2 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {/* Experience (optional) */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Experience <span className="text-muted-foreground/50">(optional)</span>
                        </label>
                        <textarea
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            placeholder="Brief description of your work experience..."
                            rows={3}
                            className="mt-2 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-destructive font-medium">{error}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full"
                        size="lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Complete Profile"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
