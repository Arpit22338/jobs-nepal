import { ThemeToggle } from "@/components/ui/theme-toggle"
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

function DefaultToggle() {
    return (
        <div className="space-y-4 text-center p-10">
            <h2 className="text-xl font-bold font-sans">Theme Toggle UI</h2>
            <div className="flex justify-center">
                <ThemeToggle />
            </div>
        </div>
    )
}

const DemoOne = () => {
    return (
        <div className="w-full h-[500px] relative bg-background overflow-hidden flex items-center justify-center rounded-[40px] border border-border/50">
            <AnimatedShaderBackground />
            <div className="z-10 text-center space-y-6 glass-card p-10 rounded-[40px]">
                <h1 className="text-5xl font-black text-foreground">Aurora Shader</h1>
                <p className="text-muted-foreground font-medium">Switch to Dark Mode to see the magic!</p>
                <div className="flex justify-center">
                    <ThemeToggle />
                </div>
            </div>
        </div>
    );
};

export { DefaultToggle, DemoOne }
