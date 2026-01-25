import { cn } from "@/lib/utils";

export const BackgroundWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn("min-h-screen w-full relative bg-background", className)}
    >
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"
          style={{ mixBlendMode: "plus-lighter" }}
        ></div>
        <div
          className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]"
          style={{ mixBlendMode: "plus-lighter" }}
        ></div>
        <div
          className="absolute bottom-[10%] left-[20%] w-[25%] h-[25%] bg-violet-600/10 rounded-full blur-[100px]"
          style={{ mixBlendMode: "plus-lighter" }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">{children}</div>
    </div>
  );
};
