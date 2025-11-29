"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const role = session?.user?.role;
  const roleRef = useRef(role);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: async (data, context, options) => {
      const currentRole = roleRef.current;
      // If role is not loaded, we can't validate, but we shouldn't wipe the data.
      // Returning values: data ensures onSubmit receives the form data.
      if (!currentRole) return { values: data, errors: {} };
      const schema = currentRole === "EMPLOYER" ? employerSchema : jobSeekerSchema;
      
      return zodResolver(schema)(data, context, options);
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.profile) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((data.profile as any).image) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue("image" as any, (data.profile as any).image);
          }
          Object.keys(data.profile).forEach((key) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue(key as any, data.profile[key]);
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

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let imageUrl = (data as any).image;

      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("File upload failed");
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
        setUploading(false);
      }

      console.log("Submitting profile data:", { ...data, image: imageUrl });

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, image: imageUrl }),
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
      setUploading(false);
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
      <form onSubmit={handleSubmit(onSubmit, (errors) => console.error("Form validation errors:", errors))} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
          />
          <input type="hidden" {...register("image")} />
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills (Comma separated)</label>
              <input
                {...register("skills", { required: "Skills are required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                placeholder="React, Node.js, TypeScript"
              />
              {getError("skills") && <p className="text-red-500 text-sm">{getError("skills")}</p>}
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
          disabled={isSubmitting || uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : isSubmitting ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
