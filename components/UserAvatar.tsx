"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, MessageSquare, Flag, UserMinus } from "lucide-react";

interface UserAvatarProps {
  userId: string;
  userName: string | null;
  userImage: string | null;
  size?: "sm" | "md" | "lg";
  showDropdown?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export default function UserAvatar({
  userId,
  userName,
  userImage,
  size = "md",
  showDropdown = true,
  className = "",
}: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (showDropdown) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  const avatarContent = (
    <>
      {userImage ? (
        <Image
          src={userImage}
          alt={userName || "User"}
          fill
          className="rounded-full object-cover"
        />
      ) : (
        <div className={`w-full h-full rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary`}>
          {userName?.[0]?.toUpperCase() || <User className="w-1/2 h-1/2" />}
        </div>
      )}
    </>
  );

  if (!showDropdown) {
    return (
      <Link
        href={`/profile/${userId}`}
        className={`relative block ${sizeClasses[size]} rounded-full overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all ${className}`}
      >
        {avatarContent}
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleClick}
        className={`relative block ${sizeClasses[size]} rounded-full overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer ${className}`}
      >
        {avatarContent}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 dropdown-glass border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-border/50 bg-accent/20">
            <p className="font-bold text-foreground text-sm truncate">{userName || "User"}</p>
          </div>
          <div className="p-1">
            <Link
              href={`/profile/${userId}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} className="text-muted-foreground" />
              View Profile
            </Link>
            <Link
              href={`/messages/${userId}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <MessageSquare size={16} className="text-muted-foreground" />
              Send Message
            </Link>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors text-left"
              onClick={() => {
                // TODO: Implement report
                setIsOpen(false);
              }}
            >
              <Flag size={16} className="text-muted-foreground" />
              Report User
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
              onClick={() => {
                // TODO: Implement block
                setIsOpen(false);
              }}
            >
              <UserMinus size={16} />
              Block User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple profile link for non-chat contexts - just navigates to profile
interface ProfileLinkProps {
  userId: string;
  children: React.ReactNode;
  className?: string;
}

export function ProfileLink({ userId, children, className = "" }: ProfileLinkProps) {
  return (
    <Link
      href={`/profile/${userId}`}
      className={`hover:text-primary transition-colors ${className}`}
    >
      {children}
    </Link>
  );
}
