"use client";

import { useState } from "react";
import { X, CreditCard, Zap, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    planName: string;
    amount: number;
    onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, planName, amount, onSuccess }: PaymentModalProps) {
    const [phone, setPhone] = useState("");
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

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

    const handleSubmit = async () => {
        if (!phone || !screenshot) return;
        setSubmitting(true);

        try {
            const res = await fetch("/api/courses/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: "basic-python",
                    paymentPhone: phone,
                    paymentScreenshot: screenshot
                })
            });

            if (res.ok) {
                onSuccess();
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

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-110 flex items-center justify-center p-4">
            <div className="glass-card rounded-[40px] max-w-xl w-full relative overflow-hidden shadow-2xl border-white/40 ring-1 ring-primary/20 bg-card">
                {/* Header */}
                <div className="p-8 border-b border-border/40 flex items-center justify-between bg-accent/10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary rounded-2xl text-white">
                            <CreditCard size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight">Checkout</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all rounded-2xl"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-black text-foreground">{planName}</h3>
                        <p className="text-sm text-muted-foreground font-medium">Scan to pay <span className="text-primary font-black">Rs. {amount}</span></p>

                        <div className="flex gap-6 justify-center">
                            <div className="text-center space-y-2">
                                <div className="p-3 bg-accent rounded-3xl border-2 border-border/50">
                                    <Image src="/esewa-qr.jpg" alt="eSewa" width={120} height={120} className="rounded-xl" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#60bb46]">eSewa</p>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="p-3 bg-accent rounded-3xl border-2 border-border/50">
                                    <Image src="/khalti-qr.jpg" alt="Khalti" width={120} height={120} className="rounded-xl" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#5c2d91]">Khalti</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-border/20">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full bg-accent/20 border-2 border-transparent focus:border-primary/30 rounded-2xl px-5 py-4 text-foreground font-bold focus:outline-none transition-all placeholder:text-muted-foreground/30"
                                    placeholder="98XXXXXXXX"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Receipt Screenshot</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={`w-full bg-accent/20 border-2 border-dashed rounded-2xl px-5 py-4 transition-all flex items-center justify-center gap-2 group-hover:bg-primary/5 ${screenshot ? "border-green-500/50 text-green-600" : "border-border/50 text-muted-foreground font-bold"}`}>
                                        <Zap size={18} className={screenshot ? "text-green-600" : "text-primary/40"} />
                                        <span className="text-sm">{screenshot ? "Uploaded" : "Upload"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !phone || !screenshot}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-5 rounded-[22px] shadow-2xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                        >
                            {submitting ? "Processing..." : "Complete Enrollment"}
                        </button>

                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <ShieldCheck size={14} className="text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Secure encrypted transaction</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
