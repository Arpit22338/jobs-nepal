"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle("dark", savedTheme === "dark");
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark");
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    if (!mounted) {
        return (
            <button className="p-2 rounded-full bg-secondary" aria-label="Toggle theme">
                <Sun size={20} className="text-muted-foreground" />
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-secondary hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
            {theme === "light" ? (
                <Moon size={18} className="text-foreground" />
            ) : (
                <Sun size={18} className="text-foreground" />
            )}
        </button>
    );
}
