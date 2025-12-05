"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, PlayCircle, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

export default function DynamicCoursePage() {
  const { courseId } = useParams();
  const { data: session } = useSession();
  
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  
  // Enrollment Form State
  const [paymentPhone, setPaymentPhone] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetch(`/api/courses/${courseId}`)
        .then(res => res.json())
        .then(data => {
          setCourse(data.course);
          setEnrollment(data.enrollment);
          if (data.course?.lessons?.length > 0) {
            setActiveLessonId(data.course.lessons[0].id);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [courseId, session]);

  const handleEnroll = async () => {
    if (!paymentPhone || !screenshot) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          paymentPhone,
          paymentScreenshot: screenshot
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setEnrollment(data);
        setShowEnrollModal(false);
        alert("Enrollment submitted! Please wait for approval.");
      } else {
        const err = await res.json();
        alert(err.error || "Enrollment failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting enrollment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, upload to S3/Cloudinary here.
    // For MVP, we'll use base64 if small, or assume the upload API exists.
    // Using the existing upload API from premium page logic
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setScreenshot(data.url);
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading course...</div>;
  if (!course) return <div className="p-8 text-center">Course not found</div>;

  const isEnrolled = enrollment?.status === "APPROVED";
  const isPending = enrollment?.status === "PENDING";
  const activeLesson = course.lessons.find((l: any) => l.id === activeLessonId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <Image src={zoomedImage} alt="Zoomed" width={800} height={800} className="object-contain max-h-screen" />
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <Link href="/courses" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{course.title}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video/Thumbnail */}
          <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
            {isEnrolled && activeLesson?.youtubeUrl ? (
              <iframe 
                src={activeLesson.youtubeUrl.replace("watch?v=", "embed/")}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                {course.thumbnailUrl ? (
                  <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                ) : (
                  <BookOpen size={64} className="text-gray-300" />
                )}
                {!isEnrolled && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center p-6">
                      <Lock size={48} className="mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Content Locked</h3>
                      <p>Enroll to access this course</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lesson Content */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            {isEnrolled ? (
              <>
                <h2 className="text-2xl font-bold mb-4">{activeLesson?.title}</h2>
                <div className="prose max-w-none">
                  <ReactMarkdown>{activeLesson?.content}</ReactMarkdown>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">About this Course</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{course.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          {!isEnrolled && (
            <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                Rs. {course.priceNpr}
              </div>
              <div className="flex items-center gap-2 text-gray-500 mb-6">
                <Clock size={16} />
                <span>{Math.round(course.totalRequiredMinutes / 60)} Hours Content</span>
              </div>

              {isPending ? (
                <button disabled className="w-full bg-gray-100 text-gray-500 py-3 rounded-lg font-bold cursor-not-allowed">
                  Enrollment Pending
                </button>
              ) : (
                <button 
                  onClick={() => setShowEnrollModal(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Enroll Now
                </button>
              )}
              
              <p className="text-xs text-center text-gray-500 mt-4">
                Lifetime access • Certificate of completion
              </p>
            </div>
          )}

          {/* Curriculum */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b font-bold">Course Content</div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {course.lessons.map((lesson: any, idx: number) => (
                <button
                  key={lesson.id}
                  onClick={() => isEnrolled && setActiveLessonId(lesson.id)}
                  disabled={!isEnrolled}
                  className={`w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    activeLessonId === lesson.id ? "bg-blue-50 text-blue-700" : ""
                  }`}
                >
                  <div className="text-gray-400 font-mono text-sm">{(idx + 1).toString().padStart(2, '0')}</div>
                  <div className="flex-1 truncate font-medium">{lesson.title}</div>
                  {isEnrolled ? (
                    <PlayCircle size={16} className={activeLessonId === lesson.id ? "text-blue-600" : "text-gray-400"} />
                  ) : (
                    <Lock size={16} className="text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Enroll in {course.title}</h2>
            
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 mb-4">Scan QR to pay Rs. {course.priceNpr}</p>
              {course.isAdminOwned || !course.teacherId ? (
                <div className="flex gap-4 justify-center">
                   <div onClick={() => setZoomedImage("/esewa-qr.jpg")} className="cursor-pointer border rounded p-1">
                     <Image src="/esewa-qr.jpg" alt="eSewa" width={100} height={100} />
                     <div className="text-xs mt-1">eSewa</div>
                   </div>
                   <div onClick={() => setZoomedImage("/khalti-qr.jpg")} className="cursor-pointer border rounded p-1">
                     <Image src="/khalti-qr.jpg" alt="Khalti" width={100} height={100} />
                     <div className="text-xs mt-1">Khalti</div>
                   </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  {course.qrCodeUrl ? (
                    <div onClick={() => setZoomedImage(course.qrCodeUrl)} className="cursor-pointer border rounded p-1">
                      <Image src={course.qrCodeUrl} alt="Teacher QR" width={200} height={200} className="mx-auto" />
                      <div className="text-xs mt-1 text-center">Scan to Pay</div>
                    </div>
                  ) : (
                     <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded mx-auto">
                       <span className="text-gray-500">No QR Available</span>
                     </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Phone Number</label>
                <input 
                  type="tel" 
                  value={paymentPhone}
                  onChange={e => setPaymentPhone(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="98XXXXXXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Payment Screenshot</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm"
                />
                {screenshot && <div className="text-green-600 text-xs mt-1">Screenshot selected</div>}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEnroll}
                  disabled={submitting || !paymentPhone || !screenshot}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
