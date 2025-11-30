"use client";

import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
  currentImage?: string | null;
  onImageChange: (base64: string) => void;
}

export default function AvatarUpload({ currentImage, onImageChange }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate File Size (Client-side)
    if (file.size > 1024 * 1024) { // 1MB
      setError("Image must be less than 1MB.");
      return;
    }

    setError(null);

    // 2. Read and Resize Image
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Target dimensions: 400x400 (Good balance for quality vs size)
        const MAX_SIZE = 400;
        const width = img.width;
        const height = img.height;

        // Calculate crop (center square)
        const minDim = Math.min(width, height);
        const sx = (width - minDim) / 2;
        const sy = (height - minDim) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;

        // Draw cropped and resized image
        ctx?.drawImage(img, sx, sy, minDim, minDim, 0, 0, MAX_SIZE, MAX_SIZE);

        // Convert to Base64 (JPEG with 0.8 quality for compression)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        
        setPreview(dataUrl);
        onImageChange(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-md bg-gray-50 flex items-center justify-center">
          {preview ? (
            <Image 
              src={preview} 
              alt="Avatar Preview" 
              width={128} 
              height={128} 
              className="w-full h-full object-cover"
            />
          ) : (
            <UserPlaceholder />
          )}
        </div>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
          title="Upload Profile Picture"
        >
          <Camera size={18} />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {error && (
        <p className="text-red-500 text-sm text-center bg-red-50 px-3 py-1 rounded-full">
          {error}
        </p>
      )}
      
      <p className="text-xs text-gray-500">
        Max 1MB. JPG, PNG or WebP.
      </p>
    </div>
  );
}

function UserPlaceholder() {
  return (
    <svg 
      className="w-16 h-16 text-gray-300" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
