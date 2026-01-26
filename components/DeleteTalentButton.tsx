"use client";

import { deleteTalentPost } from "@/app/actions";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteTalentButton({ postId }: { postId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      await deleteTalentPost(postId);
    } catch (error) {
      alert("Failed to delete post");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-destructive hover:text-destructive/80 p-1 rounded hover:bg-destructive/10 transition-colors"
      title="Delete Post"
    >
      {isDeleting ? (
        <span className="text-xs">Deleting...</span>
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
