"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  MessageCircle, Sparkles,
  CheckCircle, XCircle, Star, RefreshCw, ArrowRight, Loader2,
  Target, Mic, MicOff, Video,
  Volume2, VolumeX, Play, Download, Trash2,
  BarChart3, PieChart as PieChartIcon, Settings, Camera, StopCircle, X
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";

interface Question {
  question: string;
  tip: string;
  category?: string;
  type?: string;
  difficulty?: string;
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
  tips: string[];
}

interface InterviewAnalysis {
  overallScore: number;
  summary: string;
  categoryScores: {
    technical: number;
    behavioral: number;
    communication: number;
    problemSolving: number;
    cultureFit: number;
  };
  questionScores: Array<{
    questionNumber: number;
    question: string;
    score: number;
    feedback: string;
  }>;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  hireRecommendation: string;
  keyTakeaways: string;
}

interface SavedVideo {
  id: number;
  blob: Blob;
  date: string;
  jobTitle: string;
  questionsCount: number;
}

type InterviewMode = "text" | "voice";
type Step = "setup" | "questions" | "practice" | "feedback" | "results" | "recordings";

export default function InterviewPrepPage() {
  // Setup state
  const [step, setStep] = useState<Step>("setup");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Configuration
  const [jobTitle, setJobTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
  const [numQuestions, setNumQuestions] = useState(10);
  const [interviewMode, setInterviewMode] = useState<InterviewMode>("text");
  const [enableAIVoice, setEnableAIVoice] = useState(true);
  const [enableVideoRecording, setEnableVideoRecording] = useState(false);
  
  // Questions & Answers
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  
  // Voice mode state
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const [micStatus, setMicStatus] = useState<"prompt" | "granted" | "denied">("prompt");
  
  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const experienceLevels = ["Entry Level", "Mid-Level", "Senior", "Executive"];
  const questionCounts = [5, 10, 15, 20];

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      
      // Preload voices - they may not be available immediately
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices();
        if (voices && voices.length > 0) {
          console.log("Voices loaded:", voices.length);
        }
      };
      
      // Load voices immediately and also on voiceschanged event
      loadVoices();
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Load saved videos from IndexedDB
  useEffect(() => {
    loadSavedVideos();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAllMedia = useCallback(() => {
    // Stop speech synthesis
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    // Stop video stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, [stream]);

  // =====================
  // Question Generation
  // =====================
  const generateQuestions = async () => {
    if (!jobTitle) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          experienceLevel,
          numQuestions,
          focusTopics: []
        })
      });

      const data = await response.json();
      if (data.success) {
        // Flatten all questions
        const allQuestions: Question[] = [
          ...(data.questions.behavioral || []).map((q: Question) => ({ ...q, category: "Behavioral" })),
          ...(data.questions.technical || []).map((q: Question) => ({ ...q, category: "Technical" })),
          ...(data.questions.situational || []).map((q: Question) => ({ ...q, category: "Situational" })),
          ...(data.questions.cultureFit || []).map((q: Question) => ({ ...q, category: "Culture Fit" })),
          ...(data.questions.careerGoals || []).map((q: Question) => ({ ...q, category: "Career Goals" }))
        ].slice(0, numQuestions);
        
        setQuestions(allQuestions);
        setAnswers(new Array(allQuestions.length).fill(""));
        setStep("questions");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // =====================
  // Text-to-Speech
  // =====================
  const speakText = useCallback((text: string) => {
    if (!synthRef.current || isMuted) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    // Wait a moment for cancel to complete
    setTimeout(() => {
      if (!synthRef.current) return;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = "en-US";
      
      // Get voices and try to use a natural one
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        // Prefer natural/Google voices for better quality
        const preferredVoice = voices.find(v => 
          v.lang.startsWith("en") && (
            v.name.includes("Google") || 
            v.name.includes("Natural") || 
            v.name.includes("Samantha") ||
            v.name.includes("Female") ||
            v.name.includes("Male")
          )
        ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }
      
      utterance.onstart = () => setIsAISpeaking(true);
      utterance.onend = () => {
        setIsAISpeaking(false);
        if (interviewMode === "voice") {
          // Start listening after AI finishes speaking
          setTimeout(() => startListening(), 500);
        }
      };
      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        setIsAISpeaking(false);
      };
      
      synthRef.current.speak(utterance);
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMuted, interviewMode]);

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsAISpeaking(false);
    }
  };

  // =====================
  // Speech-to-Text
  // =====================
  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors when stopping
      }
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText + " ";
        } else {
          interimTranscript += transcriptText;
        }
      }

      // Update transcript display
      if (interimTranscript) {
        setTranscript(interimTranscript);
      }
      
      if (finalTranscript) {
        setUserAnswer(prev => prev + finalTranscript);
        setTranscript(""); // Clear interim transcript
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone access in your browser settings.");
      } else if (event.error === "no-speech") {
        // Continue listening if no speech detected
        console.log("No speech detected, continuing...");
      } else if (event.error !== "aborted") {
        setIsListening(false);
      }
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
      
      // Auto-restart if in voice mode and should still be listening
      if (interviewMode === "voice" && !isAISpeaking) {
        // Optionally restart listening
      }
    };

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      alert("Failed to start microphone. Please check your permissions.");
    }
  }, [interviewMode, isAISpeaking]);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // =====================
  // Microphone Permission
  // =====================
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      // Request microphone access to trigger browser permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      setMicStatus("granted");
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setMicStatus("denied");
      return false;
    }
  };

  // =====================
  // Video Recording
  // =====================
  const loadSavedVideos = () => {
    const request = indexedDB.open("InterviewVideos", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("videos")) {
        db.createObjectStore("videos", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["videos"], "readonly");
      const store = transaction.objectStore("videos");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        setSavedVideos(getAllRequest.result);
      };
    };
  };

  const saveVideoToIndexedDB = useCallback(() => {
    const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });

    const request = indexedDB.open("InterviewVideos", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("videos")) {
        db.createObjectStore("videos", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["videos"], "readwrite");
      const store = transaction.objectStore("videos");

      const videoData = {
        blob,
        date: new Date().toISOString(),
        jobTitle,
        questionsCount: questions.length
      };

      store.add(videoData);

      transaction.oncomplete = () => {
        alert("Interview video saved to your device! ✓");
        loadSavedVideos();
      };
    };

    recordedChunksRef.current = [];
  }, [jobTitle, questions.length]);

  const startVideoRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: true
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      mediaRecorderRef.current = new MediaRecorder(mediaStream, {
        mimeType: "video/webm;codecs=vp9,opus"
      });

      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        saveVideoToIndexedDB();
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsRecording(false);
  }, [stream]);

  const deleteVideo = (id: number) => {
    const request = indexedDB.open("InterviewVideos", 1);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["videos"], "readwrite");
      const store = transaction.objectStore("videos");
      store.delete(id);

      transaction.oncomplete = () => {
        loadSavedVideos();
      };
    };
  };

  const downloadVideo = (video: SavedVideo) => {
    const url = URL.createObjectURL(video.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Interview_${video.jobTitle}_${new Date(video.date).toLocaleDateString().replace(/\//g, "-")}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const playVideo = (video: SavedVideo) => {
    const url = URL.createObjectURL(video.blob);
    window.open(url, "_blank");
  };

  // =====================
  // Practice Flow
  // =====================
  const beginPractice = async () => {
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setTranscript("");
    setFeedback(null);
    setStep("practice");

    if (interviewMode === "voice" && enableVideoRecording) {
      await startVideoRecording();
    }

    // Speak the first question if voice mode
    if (interviewMode === "voice" && enableAIVoice) {
      setTimeout(() => {
        speakText(questions[0].question);
      }, 1000);
    }
  };

  const startPractice = async () => {
    // Show mic prompt for voice mode and wait for user to allow
    if (interviewMode === "voice") {
      setShowMicPrompt(true);
      return;
    }

    await beginPractice();
  };

  const getFeedback = async () => {
    if (!userAnswer.trim()) return;
    
    // Save answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = userAnswer;
    setAnswers(newAnswers);

    setIsGettingFeedback(true);
    try {
      const response = await fetch("/api/ai/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[currentQuestionIndex].question,
          answer: userAnswer,
          questionType: questions[currentQuestionIndex].category,
          jobTitle
        })
      });

      const data = await response.json();
      if (data.success) {
        setFeedback(data.feedback);
        setStep("feedback");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error getting feedback:", error);
      alert("Failed to get feedback. Please try again.");
    } finally {
      setIsGettingFeedback(false);
    }
  };

  const nextQuestion = useCallback(() => {
    // Stop listening if active
    stopListening();
    stopSpeaking();

    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setUserAnswer("");
      setTranscript("");
      setFeedback(null);
      setStep("practice");

      // Speak next question
      if (interviewMode === "voice" && enableAIVoice) {
        setTimeout(() => {
          speakText(questions[nextIdx].question);
        }, 500);
      }
    } else {
      // End of interview
      finishInterview();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, questions, interviewMode, enableAIVoice, speakText]);

  const finishInterview = async () => {
    // Stop recording
    if (isRecording) {
      stopVideoRecording();
    }
    stopAllMedia();

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/interview/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          answers,
          jobTitle,
          experienceLevel
        })
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setStep("results");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error analyzing interview:", error);
      setStep("results");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const skipQuestion = () => {
    // Save empty answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = "(Skipped)";
    setAnswers(newAnswers);
    nextQuestion();
  };

  // =====================
  // Chart Colors
  // =====================
  const CHART_COLORS = ["#00D9FF", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

  // =====================
  // Render Score Bar
  // =====================
  const renderScoreBar = (score: number, max: number = 10) => {
    const percentage = (score / max) * 100;
    const color = percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-accent rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-lg font-bold text-foreground">{score}/{max}</span>
      </div>
    );
  };

  // =====================
  // RENDER
  // =====================
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24">
      {showMicPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Allow Microphone Access</h3>
              <button
                onClick={() => setShowMicPrompt(false)}
                className="p-2 rounded-full hover:bg-accent transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Mic size={20} className="text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-foreground font-medium">RojgaarAI needs your microphone</p>
                  <p className="text-sm text-muted-foreground">Click “Allow” to enable voice interview. You can change this anytime in your browser site settings.</p>
                </div>
              </div>

              {micStatus === "denied" && (
                <div className="text-sm text-red-500">
                  Permission blocked. Please allow the microphone in your browser settings and try again.
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowMicPrompt(false)}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setMicStatus("prompt");
                    const ok = await requestMicrophonePermission();
                    if (ok) {
                      setShowMicPrompt(false);
                      await beginPractice();
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Allow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">
          <span className="text-primary">AI</span> Interview Prep
        </h1>
        <p className="text-muted-foreground">Practice with AI voice interviewer and get instant feedback</p>
        
        {/* Navigation Tabs */}
        {questions.length > 0 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setStep("questions")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === "questions" ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-accent/80"
              }`}
            >
              Questions
            </button>
            {savedVideos.length > 0 && (
              <button
                onClick={() => setStep("recordings")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  step === "recordings" ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-accent/80"
                }`}
              >
                <Video size={16} /> Recordings ({savedVideos.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* =================== */}
      {/* STEP 1: Setup */}
      {/* =================== */}
      {step === "setup" && (
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Settings className="text-primary" size={24} /> Interview Configuration
          </h2>

          <div className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Job Title / Role *</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="Software Engineer, Data Analyst, Product Manager..."
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium mb-2">Experience Level *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {experienceLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setExperienceLevel(level)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      experienceLevel === level
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium mb-2">Number of Questions *</label>
              <div className="grid grid-cols-4 gap-2">
                {questionCounts.map((count) => (
                  <button
                    key={count}
                    onClick={() => setNumQuestions(count)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      numQuestions === count
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">Interview Mode *</label>
              <div className="grid md:grid-cols-2 gap-3">
                <button
                  onClick={() => setInterviewMode("text")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    interviewMode === "text"
                      ? "bg-primary/10 border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <MessageCircle size={24} className={interviewMode === "text" ? "text-primary" : "text-muted-foreground"} />
                    <span className="font-semibold">Text Interview</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Type your answers in text format</p>
                </button>
                
                <button
                  onClick={() => {
                    setMicStatus("prompt");
                    setShowMicPrompt(false);
                    setInterviewMode("voice");
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    interviewMode === "voice"
                      ? "bg-primary/10 border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Mic size={24} className={interviewMode === "voice" ? "text-primary" : "text-muted-foreground"} />
                    <span className="font-semibold">🎤 Voice Interview</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Speak your answers with AI asking questions</p>
                </button>
              </div>
            </div>

            {/* Voice Interview Options */}
            {interviewMode === "voice" && (
              <div className="p-4 rounded-xl bg-accent/50 border border-border space-y-3">
                <h3 className="font-semibold text-foreground mb-3">Voice Interview Options</h3>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAIVoice}
                    onChange={(e) => setEnableAIVoice(e.target.checked)}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-medium">AI Voice Interviewer</span>
                    <p className="text-sm text-muted-foreground">AI speaks questions using text-to-speech</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableVideoRecording}
                    onChange={(e) => setEnableVideoRecording(e.target.checked)}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-medium">📹 Record My Interview</span>
                    <p className="text-sm text-muted-foreground">Save video to local browser storage</p>
                  </div>
                </label>
                
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <i className="bx bx-lock-alt"></i>
                  Your video is saved only on your device, not uploaded to any server.
                </p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateQuestions}
              disabled={!jobTitle || isGenerating}
              className="w-full py-4 bg-linear-to-r from-primary to-cyan-400 text-primary-foreground font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  Generate Interview Questions
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =================== */}
      {/* STEP 2: Questions List */}
      {/* =================== */}
      {step === "questions" && questions.length > 0 && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-border/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Your Interview Questions</h2>
                <p className="text-muted-foreground">
                  {questions.length} questions for {jobTitle} • {interviewMode === "voice" ? "🎤 Voice" : "📝 Text"} Mode
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStep("setup");
                    setQuestions([]);
                    setAnswers([]);
                  }}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
                >
                  New Setup
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {questions.map((q, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">{q.question}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                          {q.category}
                        </span>
                        {q.tip && (
                          <span className="text-muted-foreground">💡 {q.tip}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Practice Button */}
          <button
            onClick={startPractice}
            className="w-full py-4 bg-linear-to-r from-primary to-cyan-400 text-primary-foreground font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all flex items-center justify-center gap-3"
          >
            {interviewMode === "voice" ? (
              <>
                <Mic size={24} /> Start Voice Interview
              </>
            ) : (
              <>
                <MessageCircle size={24} /> Start Practice
              </>
            )}
          </button>
        </div>
      )}

      {/* =================== */}
      {/* STEP 3: Practice Mode */}
      {/* =================== */}
      {step === "practice" && questions.length > 0 && (
        <div className="space-y-6">
          {/* Video Preview */}
          {interviewMode === "voice" && enableVideoRecording && (
            <div className="glass-card rounded-2xl p-4 border border-border/50">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full max-h-64 rounded-xl bg-black object-cover"
                />
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500 text-white text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    REC
                  </div>
                )}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {isRecording ? (
                    <button
                      onClick={stopVideoRecording}
                      className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      title="Stop Recording"
                    >
                      <StopCircle size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={startVideoRecording}
                      className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      title="Start Recording"
                    >
                      <Camera size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Question Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50">
            {/* Progress */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                {questions[currentQuestionIndex].category}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-accent rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                {questions[currentQuestionIndex].question}
              </h2>
              
              {/* AI Speaking Indicator */}
              {isAISpeaking && (
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Volume2 size={20} className="animate-pulse" />
                  <span className="font-medium">AI is speaking...</span>
                  <button onClick={stopSpeaking} className="text-xs underline">Stop</button>
                </div>
              )}

              {questions[currentQuestionIndex].tip && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-primary">💡 {questions[currentQuestionIndex].tip}</p>
                </div>
              )}
            </div>

            {/* Voice Mode Controls */}
            {interviewMode === "voice" && (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (!isMuted) stopSpeaking();
                    }}
                    className={`p-3 rounded-full transition-colors ${
                      isMuted ? "bg-red-500/20 text-red-500" : "bg-accent text-foreground"
                    }`}
                    title={isMuted ? "Unmute AI" : "Mute AI"}
                  >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>

                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-6 rounded-full transition-all transform hover:scale-105 ${
                      isListening 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                  </button>

                  <button
                    onClick={() => speakText(questions[currentQuestionIndex].question)}
                    disabled={isAISpeaking}
                    className="p-3 rounded-full bg-accent text-foreground hover:bg-accent/80 transition-colors disabled:opacity-50"
                    title="Repeat Question"
                  >
                    <RefreshCw size={24} />
                  </button>
                </div>

                {isListening && (
                  <p className="text-center text-green-500 font-medium animate-pulse">
                    🎤 Listening... Speak your answer
                  </p>
                )}

                {(transcript || userAnswer) && (
                  <div className="mt-4 p-4 rounded-xl bg-accent/50 border border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Your Answer (Live):</h4>
                    <p className="text-foreground">{userAnswer || transcript || "Start speaking..."}</p>
                  </div>
                )}
              </div>
            )}

            {/* Text Mode Answer Area */}
            {interviewMode === "text" && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Your Answer</label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                  placeholder="Type your answer here... Use the STAR method (Situation, Task, Action, Result)"
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>Be specific with examples</span>
                  <span>{userAnswer.length} characters</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={skipQuestion}
                className="px-6 py-3 rounded-xl border border-border text-foreground hover:bg-accent transition-colors"
              >
                Skip
              </button>
              <button
                onClick={getFeedback}
                disabled={!userAnswer.trim() || isGettingFeedback}
                className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGettingFeedback ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Get AI Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== */}
      {/* STEP 4: Feedback */}
      {/* =================== */}
      {step === "feedback" && feedback && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                feedback.score >= 8 ? "bg-green-500/20 text-green-500" : 
                feedback.score >= 6 ? "bg-yellow-500/20 text-yellow-500" : 
                "bg-red-500/20 text-red-500"
              }`}>
                {feedback.score >= 8 ? <CheckCircle size={28} /> : 
                 feedback.score >= 6 ? <Star size={28} /> : 
                 <XCircle size={28} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Your Feedback</h2>
                <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Score</h3>
              {renderScoreBar(feedback.score)}
            </div>

            {feedback.strengths?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-green-500 mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.improvements?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target size={18} className="text-yellow-500" /> Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-yellow-500 mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.sampleAnswer && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Star size={18} className="text-primary" /> Sample Strong Answer
                </h3>
                <div className="p-4 rounded-xl bg-accent/30 border border-border/50">
                  <p className="text-foreground whitespace-pre-wrap">{feedback.sampleAnswer}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setUserAnswer("");
                setTranscript("");
                setFeedback(null);
                setStep("practice");
              }}
              className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> Try Again
            </button>
            <button
              onClick={nextQuestion}
              className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>Next Question <ArrowRight size={18} /></>
              ) : (
                <>Finish & Get Results <BarChart3 size={18} /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =================== */}
      {/* STEP 5: Results with Charts */}
      {/* =================== */}
      {step === "results" && (
        <div className="space-y-6">
          {isAnalyzing ? (
            <div className="glass-card rounded-2xl p-12 border border-border/50 text-center">
              <Loader2 size={48} className="animate-spin mx-auto text-primary mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Analyzing Your Interview...</h2>
              <p className="text-muted-foreground">Please wait while AI evaluates your performance</p>
            </div>
          ) : analysis ? (
            <>
              {/* Overall Score Card */}
              <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50">
                <div className="text-center mb-6">
                  <div className={`inline-flex w-32 h-32 rounded-full items-center justify-center text-4xl font-black mb-4 ${
                    analysis.overallScore >= 80 ? "bg-green-500/20 text-green-500" :
                    analysis.overallScore >= 60 ? "bg-yellow-500/20 text-yellow-500" :
                    "bg-red-500/20 text-red-500"
                  }`}>
                    {analysis.overallScore}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Overall Score</h2>
                  <p className="text-muted-foreground">{analysis.summary}</p>
                  <span className={`inline-block mt-3 px-4 py-1.5 rounded-full font-semibold ${
                    analysis.hireRecommendation === "Strong Hire" ? "bg-green-500/20 text-green-500" :
                    analysis.hireRecommendation === "Hire" ? "bg-green-500/10 text-green-400" :
                    analysis.hireRecommendation === "Maybe" ? "bg-yellow-500/20 text-yellow-500" :
                    "bg-red-500/20 text-red-500"
                  }`}>
                    {analysis.hireRecommendation}
                  </span>
                </div>
              </div>

              {/* Category Scores Chart */}
              <div className="glass-card rounded-2xl p-6 border border-border/50">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <PieChartIcon size={20} className="text-primary" /> Performance by Category
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-64 md:h-72 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        data={[
                          { subject: "Technical", value: analysis.categoryScores.technical, fullMark: 100 },
                          { subject: "Behavioral", value: analysis.categoryScores.behavioral, fullMark: 100 },
                          { subject: "Communication", value: analysis.categoryScores.communication, fullMark: 100 },
                          { subject: "Problem Solving", value: analysis.categoryScores.problemSolving, fullMark: 100 },
                          { subject: "Culture Fit", value: analysis.categoryScores.cultureFit, fullMark: 100 },
                        ]}
                      >
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="#00D9FF"
                          fill="#00D9FF"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="h-64 md:h-72 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Technical", value: analysis.categoryScores.technical },
                            { name: "Behavioral", value: analysis.categoryScores.behavioral },
                            { name: "Communication", value: analysis.categoryScores.communication },
                            { name: "Problem Solving", value: analysis.categoryScores.problemSolving },
                            { name: "Culture Fit", value: analysis.categoryScores.cultureFit },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          label={false}
                          labelLine={false}
                        >
                          {CHART_COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Question-by-Question Bar Chart */}
              <div className="glass-card rounded-2xl p-6 border border-border/50">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 size={20} className="text-primary" /> Question-by-Question Performance
                </h3>
                <div className="h-56 md:h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analysis.questionScores.map((q, i) => ({
                        name: `Q${i + 1}`,
                        score: q.score * 10,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="score" fill="#00D9FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6 border border-border/50">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-500" /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-green-500 mt-0.5">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-border/50">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Target size={20} className="text-yellow-500" /> Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {analysis.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-yellow-500 mt-0.5">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass-card rounded-2xl p-6 border border-border/50">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" /> Recommendations
                </h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-0.5">💡</span> {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-foreground font-medium">{analysis.keyTakeaways}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setStep("setup");
                    setQuestions([]);
                    setAnswers([]);
                    setAnalysis(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} /> Start New Interview
                </button>
                {savedVideos.length > 0 && (
                  <button
                    onClick={() => setStep("recordings")}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Video size={18} /> View Recordings
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="glass-card rounded-2xl p-8 border border-border/50 text-center">
              <XCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Analysis Unavailable</h2>
              <p className="text-muted-foreground mb-4">We couldn&apos;t analyze your interview. Please try again.</p>
              <button
                onClick={() => setStep("setup")}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl"
              >
                Start New Interview
              </button>
            </div>
          )}
        </div>
      )}

      {/* =================== */}
      {/* STEP 6: Saved Recordings */}
      {/* =================== */}
      {step === "recordings" && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-border/50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">My Recorded Interviews</h2>
                <p className="text-sm text-muted-foreground">
                  Videos are stored only on your device (not uploaded to server)
                </p>
              </div>
              <button
                onClick={() => setStep("questions")}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
              >
                Back
              </button>
            </div>

            {savedVideos.length === 0 ? (
              <div className="text-center py-12">
                <Video size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recorded interviews yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {savedVideos.map((video) => (
                  <div key={video.id} className="p-4 rounded-xl border border-border/50 bg-accent/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{video.jobTitle || "Interview"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(video.date).toLocaleDateString()} • {video.questionsCount} questions
                        </p>
                      </div>
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => playVideo(video)}
                        className="flex-1 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play size={16} /> Play
                      </button>
                      <button
                        onClick={() => downloadVideo(video)}
                        className="flex-1 py-2 rounded-lg border border-border hover:bg-accent transition-colors flex items-center justify-center gap-2"
                      >
                        <Download size={16} /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
