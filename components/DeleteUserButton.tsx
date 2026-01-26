"use client";

import { deleteUser } from "@/app/actions";
import { useState } from "react";

export default function DeleteUserButton({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      await deleteUser(userId);
    } catch (error) {
      alert("Failed to delete user");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-destructive hover:text-destructive/80 disabled:opacity-50 ml-4"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
