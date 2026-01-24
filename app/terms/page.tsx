import React from "react";
import { Scale, CheckCircle, AlertTriangle, Users } from "lucide-react";

export default function TermsOfServicePage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-foreground mb-4">Terms of Service</h1>
                <p className="text-muted-foreground text-lg">Please read these terms carefully before using RojgaarNepal.</p>
            </div>

            <div className="space-y-12">
                <section className="glass-card p-8 rounded-2xl border-l-4 border-primary">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Scale className="text-primary" /> 1. Acceptance of Terms
                    </h2>
                    <p className="text-muted-foreground">
                        By accessing or using RojgaarNepal, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Users className="text-primary" /> 2. User Accounts
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <CheckCircle className="text-primary" /> 3. Content Policy
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Users are responsible for the content they post. Jobs must be legitimate, and profiles must be accurate. We reserve the right to remove content that violates our policies or is deemed inappropriate.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-primary" /> 4. Limitation of Liability
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        RojgaarNepal shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the service.
                    </p>
                </section>
            </div>
        </div>
    );
}
