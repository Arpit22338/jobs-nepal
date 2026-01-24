"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileCompletionModal from "./ProfileCompletionModal";

// Extended session user type
interface ExtendedUser {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    isProfileComplete?: boolean;
}

export default function ProfileCompletionCheck() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [showModal, setShowModal] = useState(false);
    const [profileStatus, setProfileStatus] = useState<boolean | null>(null);

    // Pages where we don't show the modal
    const excludedPaths = [
        "/login", "/register", "/forgot-password", "/reset-password",
        "/verify-email", "/admin", "/api"
    ];

    useEffect(() => {
        const checkProfileStatus = async () => {
            if (status !== "authenticated" || !session?.user) return;

            try {
                const res = await fetch("/api/profile/status");
                if (res.ok) {
                    const data = await res.json();
                    setProfileStatus(data.isProfileComplete);
                }
            } catch (error) {
                console.error("Failed to check profile status:", error);
            }
        };

        checkProfileStatus();
    }, [session, status]);

    // Don't show for admins, employers, or teachers (they have different flows)
    const user = session?.user as ExtendedUser | undefined;
    const isJobSeeker = user?.role === "JOBSEEKER";

    // Determine if we should show the modal
    const shouldShow =
        status === "authenticated" &&
        isJobSeeker &&
        profileStatus === false &&
        !excludedPaths.some((p) => pathname.startsWith(p));

    if (!shouldShow || !user) return null;

    return (
        <ProfileCompletionModal
            userName={user.name || "User"}
            userEmail={user.email || ""}
        />
    );
}
