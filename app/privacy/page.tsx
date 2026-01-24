import React from "react";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-foreground mb-4">Privacy Policy</h1>
                <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-12">
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Shield size={28} />
                        <h2 className="text-2xl font-bold text-foreground">Data Protection</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        At RojgaarNepal, we take your data privacy seriously. We implement robust security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Eye size={28} />
                        <h2 className="text-2xl font-bold text-foreground">Information Collection</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        We collect information you provide directly to us, such as when you create an account, update your profile, post a job, or communicate with us. This may include your name, email address, phone number, and professional details.
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Lock size={28} />
                        <h2 className="text-2xl font-bold text-foreground">How We Use Your Data</h2>
                    </div>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>To provide, maintain, and improve our services.</li>
                        <li>To match job seekers with relevant opportunities.</li>
                        <li>To communicate with you about updates, security alerts, and support.</li>
                        <li>To prevent fraud and ensure platform safety.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <FileText size={28} />
                        <h2 className="text-2xl font-bold text-foreground">Cookies</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        We use cookies to enhance your experience, gather usage statistics, and personalize content. You can control cookie preferences through your browser settings.
                    </p>
                </section>
            </div>
        </div>
    );
}
