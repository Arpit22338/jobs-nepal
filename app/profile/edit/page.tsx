"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AvatarUpload from "@/components/AvatarUpload";
import { X, Plus } from "lucide-react";

const jobSeekerSchema = z.object({
  bio: z.string().nullable().optional(),
  skills: z.string().min(2, "Skills are required"),
  location: z.string().min(2, "Location is required"),
  experience: z.string().min(2, "Experience is required"),
  education: z.string().nullable().optional(),
  resumeUrl: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

const employerSchema = z.object({
  companyName: z.string().min(2, "Company Name is required"),
  description: z.string().min(10, "Description is required"),
  location: z.string().min(2, "Location is required"),
  website: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

type JobSeekerFormData = z.infer<typeof jobSeekerSchema>;
type EmployerFormData = z.infer<typeof employerSchema>;
type ProfileFormData = JobSeekerFormData | EmployerFormData;

interface Skill {
  name: string;
  level: number;
}

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Skills State
  const [skillInput, setSkillInput] = useState("");
  const [skillsList, setSkillsList] = useState<Skill[]>([]);

  const role = session?.user?.role;
  const roleRef = useRef(role);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: async (data, _context, _options) => {
      const currentRole = roleRef.current;
      if (!currentRole) return { values: data, errors: {} };
      const schema = currentRole === "EMPLOYER" ? employerSchema : jobSeekerSchema;
      return zodResolver(schema)(data, _context, _options);
    },
  });

  const currentImage = useWatch({ control, name: "image" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.profile) {
          // Handle Image
          if (data.profile.image) {
            setValue("image", data.profile.image);
          }
          
          // Handle Skills (Parse JSON or split string)
          if (data.profile.skills) {
            try {
              const parsed = JSON.parse(data.profile.skills);
              if (Array.isArray(parsed)) {
                setSkillsList(parsed);
              } else {
                // Fallback if it's not an array
                setSkillsList([{ name: data.profile.skills, level: 50 }]);
              }
            } catch {
              // It's a plain string (old format)
              const tags = data.profile.skills.split(",").map((s: string) => ({
                name: s.trim(),
                level: 50 // Default level
              })).filter((s: { name: string }) => s.name);
              setSkillsList(tags);
            }
          }

          Object.keys(data.profile).forEach((key) => {
            if (key !== 'skills' && key !== 'image') {
               setValue(key as keyof ProfileFormData, data.profile[key]);
            }
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
  }, [status, router, setValue]);

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    // Split by comma if user pasted a list
    const newSkills = skillInput.split(",").map(s => s.trim()).filter(s => s);
    
    const uniqueNewSkills = newSkills.filter(
      ns => !skillsList.some(existing => existing.name.toLowerCase() === ns.toLowerCase())
    );

    const skillsToAdd = uniqueNewSkills.map(name => ({ name, level: 50 }));
    
    setSkillsList([...skillsList, ...skillsToAdd]);
    setSkillInput("");
  };

  const handleRemoveSkill = (index: number) => {
    const newList = [...skillsList];
    newList.splice(index, 1);
    setSkillsList(newList);
  };

  const handleLevelChange = (index: number, newLevel: number) => {
    const newList = [...skillsList];
    newList[index].level = newLevel;
    setSkillsList(newList);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Prepare skills data
      const finalData = { ...data };
      if (role === "JOBSEEKER") {
        // Save skills as JSON string
        (finalData as JobSeekerFormData).skills = JSON.stringify(skillsList);
      }

      console.log("Submitting profile data:", finalData);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        router.push("/profile");
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error("Profile update failed:", errorData);
        alert(`Failed to update profile: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Something went wrong. Check console for details.");
    }
  };

  // Helper to safely access errors
  const getError = (field: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (errors as any)[field]?.message;
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit(onSubmit, (errors) => console.error("Form validation errors:", errors))} className="space-y-6">
        
        {/* Avatar Upload Section */}
        <div className="flex justify-center mb-6">
          <AvatarUpload 
            currentImage={currentImage || undefined} 
            onImageChange={(base64) => setValue("image", base64)} 
          />
        </div>

        {role === "EMPLOYER" ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                {...register("companyName", { required: "Company Name is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              />
              {getError("companyName") && <p className="text-red-500 text-sm">{getError("companyName")}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register("description", { required: "Description is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                rows={4}
              />
              {getError("description") && <p className="text-red-500 text-sm">{getError("description")}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                {...register("location", { required: "Location is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              />
              {getError("location") && <p className="text-red-500 text-sm">{getError("location")}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                {...register("website")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                {...register("bio")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                rows={3}
              />
            </div>

            {/* Skills Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills & Proficiency</label>
              <div className="flex gap-2 mb-3">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 rounded-md border-gray-300 shadow-sm border p-2"
                  placeholder="Type a skill (e.g. React) and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              {/* Skills List */}
              <div className="space-y-3">
                {skillsList.map((skill, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md border flex items-center gap-4">
                    <div className="flex-1 font-medium">{skill.name}</div>
                    <div className="flex items-center gap-2 w-1/2">
                      <span className="text-xs text-gray-500 w-8">{skill.level}%</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={skill.level} 
                        onChange={(e) => handleLevelChange(index, parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                {skillsList.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No skills added yet.</p>
                )}
              </div>
              {/* Hidden input to satisfy validation if needed, though we handle it manually */}
              <input type="hidden" {...register("skills")} value={JSON.stringify(skillsList)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                {...register("location", { required: "Location is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              />
              {getError("location") && <p className="text-red-500 text-sm">{getError("location")}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <input
                {...register("experience", { required: "Experience is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                placeholder="2 years as Frontend Dev"
              />
              {getError("experience") && <p className="text-red-500 text-sm">{getError("experience")}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Education</label>
              <input
                {...register("education")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
