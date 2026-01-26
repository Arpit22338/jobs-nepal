"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Send, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { deleteQuestion, createAnswer, deleteAnswer, createQuestion } from "@/app/actions";

interface Answer {
    id: string;
    content: string;
    userId: string;
    createdAt: string | Date;
    user: {
        name: string | null;
        image: string | null;
    };
}

interface Question {
    id: string;
    content: string;
    userId: string;
    createdAt: string | Date;
    user: {
        name: string | null;
        image: string | null;
    };
    answers: Answer[];
}

interface QnaSectionProps {
    initialQuestions: Question[];
    jobId: string;
    currentUserId?: string;
    employerId: string;
    isAdmin?: boolean;
}

export default function QnaSection({
    initialQuestions,
    jobId,
    currentUserId,
    employerId,
    isAdmin
}: QnaSectionProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [questions, setQuestions] = useState(initialQuestions);
    const [newQuestionContent, setNewQuestionContent] = useState("");
    const [replyContents, setReplyContents] = useState<{ [key: string]: string }>({});
    const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePostQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestionContent.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await createQuestion(jobId, newQuestionContent);
            setNewQuestionContent("");
            window.location.reload(); // Simplest way to refresh hydrated state for now
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePostReply = async (questionId: string) => {
        const content = replyContents[questionId];
        if (!content?.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await createAnswer(questionId, content);
            setReplyContents(prev => ({ ...prev, [questionId]: "" }));
            window.location.reload();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleReplies = (questionId: string) => {
        setExpandedReplies(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    };

    return (
        <section className="space-y-8 pt-8 border-t border-border/40">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-foreground">Community Q&A</h2>
                <div className="px-4 py-1.5 bg-accent rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                    {questions.length} Discussion{questions.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Ask Question Form */}
            {currentUserId && (
                <form onSubmit={handlePostQuestion} className="relative">
                    <input
                        value={newQuestionContent}
                        onChange={(e) => setNewQuestionContent(e.target.value)}
                        type="text"
                        placeholder="Got a question? Ask the employer publicly..."
                        className="w-full pl-6 pr-24 py-5 bg-accent/20 border-2 border-transparent focus:border-primary/30 rounded-[28px] focus:outline-none focus:bg-background transition-all text-foreground font-bold placeholder:text-muted-foreground/50 shadow-inner"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground font-black px-6 py-2.5 rounded-2xl hover:bg-primary/90 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        <Send size={16} /> {isSubmitting ? "Post..." : "Post"}
                    </button>
                </form>
            )}

            <div className="space-y-8">
                {questions.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-3xl border-dashed border-2">
                        <MessageCircle size={40} className="text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-bold">Be the first to start the conversation!</p>
                    </div>
                ) : (
                    questions.map((q) => (
                        <div key={q.id} className="space-y-4">
                            <div className="glass-card p-6 rounded-4xl border-primary/10">
                                <div className="flex items-start gap-4 mb-4">
                                    <Link href={`/profile/${q.userId}`} className="shrink-0 group">
                                        {q.user.image ? (
                                            <Image
                                                src={q.user.image}
                                                alt={q.user.name || "User"}
                                                width={48}
                                                height={48}
                                                className="rounded-2xl object-cover border-2 border-accent group-hover:border-primary transition-colors"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-primary font-black uppercase text-xl group-hover:bg-primary/10 transition-colors">
                                                {q.user.name?.[0] || "U"}
                                            </div>
                                        )}
                                    </Link>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <Link href={`/profile/${q.userId}`} className="font-black text-foreground hover:text-primary transition-colors">
                                                {q.user.name}
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {new Date(q.createdAt).toLocaleDateString()}
                                                </span>
                                                {(currentUserId === q.userId || currentUserId === employerId || isAdmin) && (
                                                    <button
                                                        onClick={async () => {
                                                            await deleteQuestion(q.id);
                                                            window.location.reload();
                                                        }}
                                                        className="text-destructive/70 hover:text-destructive p-2 hover:bg-destructive/10 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-foreground/90 font-medium text-lg leading-relaxed mt-2">{q.content}</p>

                                        {/* Reply Count Logic */}
                                        <div className="mt-4 flex items-center gap-4">
                                            <button
                                                onClick={() => toggleReplies(q.id)}
                                                className="text-xs font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                                            >
                                                {expandedReplies[q.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                {q.answers.length} {q.answers.length === 1 ? "Reply" : "Replies"}
                                            </button>
                                            {!expandedReplies[q.id] && currentUserId && (
                                                <button
                                                    onClick={() => toggleReplies(q.id)}
                                                    className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    Reply
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Nested Replies */}
                                {expandedReplies[q.id] && (
                                    <div className="ml-12 md:ml-16 mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-4 border-l-2 border-primary/10 pl-6">
                                            {q.answers.map((answer) => (
                                                <div key={answer.id} className="bg-accent/30 p-4 rounded-2xl border border-border/40 relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-black text-sm text-foreground">
                                                                {answer.user.name}
                                                            </span>
                                                            {answer.userId === employerId && (
                                                                <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border border-primary/20">
                                                                    Employer
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                                {new Date(answer.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {(currentUserId === answer.userId || isAdmin) && (
                                                            <button
                                                                onClick={async () => {
                                                                    await deleteAnswer(answer.id);
                                                                    window.location.reload();
                                                                }}
                                                                className="text-destructive/70 hover:text-destructive p-1.5 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-muted-foreground font-medium text-base">{answer.content}</p>
                                                </div>
                                            ))}

                                            {/* Reply Form */}
                                            {currentUserId && (
                                                <div className="flex gap-2 group pt-2">
                                                    <input
                                                        value={replyContents[q.id] || ""}
                                                        onChange={(e) => setReplyContents(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                        type="text"
                                                        placeholder="Share your thoughts..."
                                                        className="flex-1 bg-accent/20 border-2 border-transparent focus:border-primary/20 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none transition-all"
                                                        required
                                                    />
                                                    <button
                                                        onClick={() => handlePostReply(q.id)}
                                                        disabled={isSubmitting}
                                                        className="bg-accent hover:bg-primary/10 text-primary font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        <MessageCircle size={16} /> {isSubmitting ? "..." : "Reply"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
