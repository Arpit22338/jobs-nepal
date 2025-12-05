"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceNpr: 299,
    totalRequiredMinutes: 660, // 11 hours default
    thumbnailUrl: "",
    qrCodeUrl: "", // New field for teacher's payment QR
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priceNpr' || name === 'totalRequiredMinutes' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/teacher/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create course");
      }

      const data = await res.json();
      // Redirect to the course edit page or dashboard
      router.push(`/teacher/course/${data.id}/edit`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/teacher/dashboard" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600 mt-2">Start building your curriculum</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Basic information about your course.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g. Advanced Python for Data Science"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="What will students learn in this course?"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="priceNpr">Price (NPR)</Label>
                <Input
                  id="priceNpr"
                  name="priceNpr"
                  type="number"
                  required
                  min="0"
                  value={formData.priceNpr}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalRequiredMinutes">Duration (Minutes)</Label>
                <Input
                  id="totalRequiredMinutes"
                  name="totalRequiredMinutes"
                  type="number"
                  required
                  min="1"
                  value={formData.totalRequiredMinutes}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500">
                  {Math.floor(formData.totalRequiredMinutes / 60)} hours {formData.totalRequiredMinutes % 60} minutes
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                name="thumbnailUrl"
                placeholder="https://..."
                value={formData.thumbnailUrl}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">Link to an image for your course card.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qrCodeUrl">Payment QR Code URL</Label>
              <Input
                id="qrCodeUrl"
                name="qrCodeUrl"
                placeholder="https://..."
                value={formData.qrCodeUrl}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">
                Upload your payment QR code (eSewa/Khalti/Bank) to a hosting service and paste the link here. 
                Students will scan this to pay you directly.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Create Course
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
