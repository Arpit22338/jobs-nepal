"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, PlayCircle, Lock, ShieldCheck, CreditCard, X, ChevronRight, Zap } from "lucide-react";
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

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-muted-foreground font-bold tracking-tight">Accessing Course Material...</p>
    </div>
  );

  if (!course) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
      <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center text-primary/30">
        <BookOpen size={40} />
      </div>
      <h1 className="text-2xl font-black text-foreground">Course Not Found</h1>
      <Link href="/courses" className="text-primary font-black hover:underline">Explore all courses</Link>
    </div>
  );

  const isEnrolled = enrollment?.status === "APPROVED";
  const isPending = enrollment?.status === "PENDING";
  const activeLesson = course.lessons.find((l: any) => l.id === activeLessonId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-100 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative w-full max-w-2xl aspect-3/4">
            <Image src={zoomedImage} alt="Zoomed" fill className="object-contain" />
          </div>
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
            <X size={32} />
          </button>
        </div>
      )}

      {/* Course Top Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border/40">
        <div className="flex items-center gap-6">
          <Link href="/courses" className="p-4 bg-accent hover:bg-primary/10 text-primary rounded-2xl transition-all active:scale-95 shadow-sm group">
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Learning Portal</span>
              <ChevronRight size={12} className="text-muted-foreground" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] truncate max-w-[150px]">{course.title}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">{course.title}</h1>
          </div>
        </div>

        {isEnrolled && (
          <div className="flex items-center gap-3 px-6 py-2 bg-green-500/10 text-green-600 border border-green-200 rounded-2xl font-black uppercase tracking-widest text-xs">
            <ShieldCheck size={18} /> Student Access
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Player Shell */}
          <div className="glass-card rounded-[40px] overflow-hidden shadow-2xl relative border-white/40 ring-1 ring-primary/5">
            <div className="aspect-video bg-black relative">
              {isEnrolled && activeLesson?.youtubeUrl ? (
                <iframe
                  src={activeLesson.youtubeUrl.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center relative group">
                  {course.thumbnailUrl ? (
                    <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover opacity-60 transition-opacity group-hover:opacity-40" />
                  ) : (
                    <div className="w-full h-full bg-accent/20 flex items-center justify-center text-primary/10">
                      <BookOpen size={120} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                    <div className="text-white text-center p-8 max-w-sm space-y-6">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-white/20">
                        <Lock size={32} className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tight">Curriculum Locked</h3>
                        <p className="text-white/60 font-medium">Please enroll below to access high-quality video lessons and source material.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Title Under Video */}
            {isEnrolled && (
              <div className="p-8 space-y-2 border-t border-border/40">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Current Lesson</span>
                <h2 className="text-3xl font-black text-foreground">{activeLesson?.title}</h2>
              </div>
            )}
          </div>

          {/* Detailed Content */}
          <div className="glass-card p-8 md:p-12 rounded-[40px] shadow-xl border-white/40 min-h-[400px]">
            {isEnrolled ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <Zap size={24} fill="currentColor" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Learning Resources</h3>
                </div>
                <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground font-medium leading-relaxed prose-headings:text-foreground prose-headings:font-black prose-a:text-primary prose-a:font-bold hover:prose-a:underline">
                  <ReactMarkdown>{activeLesson?.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Course Syllabus</h3>
                  <h2 className="text-4xl font-black text-foreground">About this Journey</h2>
                </div>
                <p className="text-muted-foreground text-xl font-medium leading-relaxed whitespace-pre-wrap">{course.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-border/40">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Expert</span>
                    <p className="text-lg font-black text-foreground">{course.instructor || "Rojgaar Team"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Duration</span>
                    <p className="text-lg font-black text-foreground">{Math.round(course.totalRequiredMinutes / 60)} Hours</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Lessons</span>
                    <p className="text-lg font-black text-foreground">{course.lessons.length} Modules</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          {/* Enrollment CTA Block */}
          {!isEnrolled && (
            <div className="glass-card p-10 rounded-[40px] shadow-2xl border-primary/20 bg-primary/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative z-10 space-y-8">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Investment</span>
                  <div className="text-5xl font-black tracking-tighter text-foreground">
                    <span className="text-xl text-primary align-top mr-1">Rs.</span>
                    {course.priceNpr}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground font-bold text-sm">
                    <Clock size={18} className="text-primary" />
                    <span>Lifetime learning access</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground font-bold text-sm">
                    <ShieldCheck size={18} className="text-primary" />
                    <span>Professional certification</span>
                  </div>
                </div>

                {isPending ? (
                  <div className="w-full bg-accent text-primary/40 font-black py-5 rounded-2xl text-center flex items-center justify-center gap-2">
                    <Clock size={20} className="animate-pulse" /> Pending Verification
                  </div>
                ) : (
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Enroll & Start Learning
                  </button>
                )}

                <div className="pt-4 flex justify-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
                  <Image src="/khalti-qr.jpg" alt="Khalti" width={24} height={24} className="h-6 w-auto" />
                  <Image src="/esewa-qr.jpg" alt="eSewa" width={24} height={24} className="h-6 w-auto" />
                </div>
              </div>
            </div>
          )}

          {/* Curriculum Index */}
          <div className="glass-card rounded-[40px] overflow-hidden shadow-xl border-white/40 flex flex-col max-h-[700px]">
            <div className="p-8 border-b border-border/50 bg-accent/20 flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">Curriculum</h3>
              <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">
                {course.lessons.length} Parts
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border/30 custom-scrollbar">
              {course.lessons.map((lesson: any, idx: number) => (
                <button
                  key={lesson.id}
                  onClick={() => isEnrolled && setActiveLessonId(lesson.id)}
                  disabled={!isEnrolled}
                  className={`w-full p-6 text-left flex items-start gap-4 hover:bg-primary/5 transition-all group ${activeLessonId === lesson.id ? "bg-primary/10" : ""
                    }`}
                >
                  <div className={`mt-1 font-black text-xs min-w-6 tracking-tighter ${activeLessonId === lesson.id ? "text-primary" : "text-muted-foreground/40"}`}>
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className={`font-bold text-sm leading-tight transition-colors ${activeLessonId === lesson.id ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                      {lesson.title}
                    </div>
                    {!isEnrolled && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                        <Lock size={10} /> Needs Enrollment
                      </div>
                    )}
                  </div>
                  {isEnrolled && (
                    <PlayCircle size={20} className={activeLessonId === lesson.id ? "text-primary" : "text-muted-foreground/30 group-hover:text-primary/50"} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-110 flex items-center justify-center p-4">
          <div className="glass-card rounded-[40px] max-w-xl w-full relative overflow-hidden shadow-2xl border-white/40 ring-1 ring-primary/20">
            {/* Modal Header */}
            <div className="p-8 border-b border-border/40 flex items-center justify-between bg-accent/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary rounded-2xl text-white">
                  <CreditCard size={24} />
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Access Course</h2>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="p-3 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all rounded-2xl"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[80vh] overflow-y-auto space-y-8 custom-scrollbar">
              {/* QR Section */}
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-foreground">Scan & Pay Securely</h3>
                  <p className="text-sm text-muted-foreground font-medium">Please pay exactly <span className="text-primary font-black">Rs. {course.priceNpr}</span> through any mobile wallet.</p>
                </div>

                {course.isAdminOwned || !course.teacherId ? (
                  <div className="flex gap-6 justify-center">
                    <button onClick={() => setZoomedImage("/esewa-qr.jpg")} className="group outline-none">
                      <div className="p-3 bg-accent rounded-3xl border-4 border-transparent hover:border-primary/20 transition-all shadow-inner relative">
                        <Image src="/esewa-qr.jpg" alt="eSewa" width={140} height={140} className="rounded-xl" />
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center text-primary font-black text-xs uppercase tracking-widest">Zoom</div>
                      </div>
                      <div className="mt-3 font-black text-xs uppercase tracking-widest text-[#60bb46]">eSewa</div>
                    </button>
                    <button onClick={() => setZoomedImage("/khalti-qr.jpg")} className="group outline-none">
                      <div className="p-3 bg-accent rounded-3xl border-4 border-transparent hover:border-primary/20 transition-all shadow-inner relative">
                        <Image src="/khalti-qr.jpg" alt="Khalti" width={140} height={140} className="rounded-xl" />
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center text-primary font-black text-xs uppercase tracking-widest">Zoom</div>
                      </div>
                      <div className="mt-3 font-black text-xs uppercase tracking-widest text-[#5c2d91]">Khalti</div>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    {course.qrCodeUrl ? (
                      <button onClick={() => setZoomedImage(course.qrCodeUrl)} className="group outline-none inline-block">
                        <div className="p-6 bg-accent rounded-4xl border-4 border-transparent hover:border-primary/20 transition-all shadow-inner relative">
                          <Image src={course.qrCodeUrl} alt="Teacher QR" width={220} height={220} className="rounded-2xl" />
                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-4xl flex items-center justify-center text-primary font-black text-xs uppercase tracking-widest">Zoom to Pay</div>
                        </div>
                        <p className="mt-4 font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">Teacher Receipt QR</p>
                      </button>
                    ) : (
                      <div className="w-full h-48 bg-accent flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/50">
                        <X className="text-muted-foreground/30 mb-2" size={32} />
                        <span className="text-muted-foreground font-black text-sm uppercase tracking-widest">Payment QR Unavailable</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Section */}
              <div className="space-y-6 pt-8 border-t border-border/20">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Wallet Phone</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={paymentPhone}
                        onChange={e => setPaymentPhone(e.target.value)}
                        className="w-full bg-accent/20 border-2 border-transparent focus:border-primary/30 rounded-2xl px-5 py-4 text-foreground font-bold focus:outline-none transition-all placeholder:text-muted-foreground/30"
                        placeholder="98XXXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Proof of Success</label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full bg-accent/20 border-2 border-dashed rounded-2xl px-5 py-4 transition-all flex items-center justify-center gap-2 group-hover:bg-primary/5 ${screenshot ? "border-green-500/50 text-green-600" : "border-border/50 text-muted-foreground font-bold"}`}>
                        <Zap size={18} className={screenshot ? "text-green-600" : "text-primary/40"} />
                        <span className="text-sm">{screenshot ? "Screenshot Loaded" : "Upload Receipt"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={submitting || !paymentPhone || !screenshot}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-5 rounded-[22px] shadow-2xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Zap size={20} fill="currentColor" />
                  )}
                  {submitting ? "Processing..." : "Confirm Enrollment"}
                </button>
                <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-60">Verified security portal • Encrypted transaction</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
