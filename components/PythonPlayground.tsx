"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Play, RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface PythonPlaygroundProps {
  initialCode: string;
  expectedOutput?: string;
  challengeTitle?: string;
  challengeDescription?: string;
  onSuccess?: () => void;
}

let pyodideReadyPromise: Promise<any> | null = null;

export default function PythonPlayground({ 
  initialCode, 
  expectedOutput, 
  challengeTitle,
  challengeDescription,
  onSuccess 
}: PythonPlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setCode(initialCode);
    setOutput("");
    setStatus("idle");
  }, [initialCode]);

  useEffect(() => {
    const loadPyodide = async () => {
      if (pyodideReadyPromise) {
        await pyodideReadyPromise;
        setIsLoading(false);
        return;
      }

      pyodideReadyPromise = (async () => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        // @ts-expect-error - loadPyodide is loaded from external script
        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
        });

        return pyodide;
      })();

      try {
        await pyodideReadyPromise;
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load Pyodide:", err);
        setIsLoading(false);
        setOutput("Failed to load Python runtime. Please refresh the page.");
      }
    };

    loadPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodideReadyPromise) {
      setOutput("Python runtime not initialized.");
      return;
    }

    setIsRunning(true);
    setOutput("Executing...");
    setStatus("idle");

    try {
      const pyodide = await pyodideReadyPromise;

      // Capture stdout
      pyodide.runPython(`
import sys
from io import StringIO
_stdout_capture = StringIO()
sys.stdout = _stdout_capture
`);

      // Execute the user code
      try {
        pyodide.runPython(code);
      } catch (e) {
        throw e;
      }

      // Get captured output
      const result = pyodide.runPython("_stdout_capture.getvalue()");
      
      setOutput(result || "(No output)");

      // Check expected output
      if (expectedOutput) {
        const cleanOutput = (result || "").trim();
        const cleanExpected = expectedOutput.trim();

        if (cleanOutput === cleanExpected) {
          setStatus("success");
          if (onSuccess) onSuccess();
        } else {
          setStatus("error");
        }
      }
    } catch (err: any) {
      console.error("Execution error:", err);
      const errorMsg = err.message || String(err);
      setOutput(`Error: ${errorMsg}`);
      setStatus("error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col w-full border rounded-lg md:rounded-xl overflow-hidden bg-slate-900 text-white shadow-2xl ring-1 ring-slate-800 h-[450px] sm:h-[500px] md:h-[580px]">
      
      {/* Challenge Info Section */}
      {(challengeTitle || challengeDescription || expectedOutput) && (
        <div className="bg-slate-800/50 p-2.5 sm:p-3 md:p-4 border-b border-slate-700 space-y-2 md:space-y-3 shrink-0">
          {challengeTitle && (
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-[11px] sm:text-xs md:text-sm uppercase tracking-wider">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-pulse" />
              {challengeTitle}
            </div>
          )}
          
          {challengeDescription && (
            <div className="text-slate-300 text-[11px] sm:text-xs md:text-sm leading-relaxed">
              <span className="font-bold text-slate-200">Goal: </span>
              {challengeDescription}
            </div>
          )}

          {expectedOutput && (
            <div className="bg-slate-950/50 rounded p-2 md:p-3 border border-slate-800">
              <div className="text-[10px] md:text-xs font-mono text-slate-500 mb-1 uppercase">Expected Output:</div>
              <pre className="text-green-400/90 font-mono text-[10px] md:text-xs whitespace-pre-wrap break-words">{expectedOutput}</pre>
            </div>
          )}
        </div>
      )}

      {/* Editor Header */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          <span className="ml-1 md:ml-2 text-[10px] md:text-xs font-mono text-slate-400">main.py</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 md:h-7 text-[10px] md:text-xs text-slate-400 hover:text-white hover:bg-slate-700 px-2 md:px-3"
            onClick={() => {
              setCode(initialCode);
              setOutput("");
              setStatus("idle");
            }}
          >
            <RefreshCw className="w-3 h-3 md:mr-1" />
            <span className="hidden md:inline">Reset</span>
          </Button>
          <Button
            size="sm"
            className={`h-6 md:h-7 text-[10px] md:text-xs font-medium px-3 md:px-4 ${
              isLoading ? "bg-slate-700 text-slate-400" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
            } border-0 transition-all`}
            onClick={runCode}
            disabled={isLoading || isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin md:mr-1" />
                <span className="hidden md:inline">Running</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 md:mr-1 fill-current" />
                <span className="hidden sm:inline">{isLoading ? "Loading..." : "Run"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="h-[120px] sm:h-[140px] md:h-[160px] relative overflow-hidden group shrink-0">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full p-2.5 sm:p-3 md:p-4 bg-slate-900 text-slate-100 font-mono text-[11px] sm:text-xs md:text-sm resize-none focus:outline-none leading-relaxed selection:bg-blue-500/30 overflow-auto"
          spellCheck={false}
          style={{ tabSize: 4 }}
        />
        <div className="absolute bottom-2 right-2 text-[9px] md:text-[10px] text-slate-600 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          Python 3.11 (Pyodide)
        </div>
      </div>

      {/* Output Panel */}
      <div className="flex-1 min-h-0 bg-black border-t border-slate-700 flex flex-col shrink-0">
        <div className="px-2.5 sm:px-3 md:px-4 py-2 bg-slate-950 border-b border-slate-800 text-[10px] sm:text-xs font-mono flex justify-between items-center shrink-0">
          <span className="text-slate-500 font-semibold">OUTPUT</span>
          {status === "success" && (
            <span className="text-green-400 flex items-center gap-1 md:gap-1.5 bg-green-950/30 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full border border-green-900/50 text-[8px] md:text-[10px]">
              <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" /> 
              <span className="hidden sm:inline">Correct!</span>
              <span className="sm:hidden">✓</span>
            </span>
          )}
          {status === "error" && (
            <span className="text-red-400 flex items-center gap-1 md:gap-1.5 bg-red-950/30 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full border border-red-900/50 text-[8px] md:text-[10px]">
              <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3" /> 
              <span className="hidden sm:inline">Wrong output</span>
              <span className="sm:hidden">✗</span>
            </span>
          )}
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          <pre className={`p-3 sm:p-3 md:p-4 font-mono text-[12px] sm:text-sm md:text-base whitespace-pre-wrap break-words transition-colors ${
            status === 'error' ? 'text-red-300/90' : 'text-slate-300'
          }`}>
            {output || <span className="text-slate-600 italic text-[10px] sm:text-xs">Click &quot;Run&quot; to see output...</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
