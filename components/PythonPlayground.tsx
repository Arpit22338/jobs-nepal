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

declare global {
  interface Window {
    loadPyodide: any;
  }
}

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
  const [pyodide, setPyodide] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setCode(initialCode);
    setOutput("");
    setStatus("idle");
  }, [initialCode]);

  useEffect(() => {
    const loadPyodideScript = async () => {
      if (window.loadPyodide) {
        const py = await window.loadPyodide();
        setPyodide(py);
        setIsLoading(false);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
      script.async = true;
      script.onload = async () => {
        try {
          const py = await window.loadPyodide();
          setPyodide(py);
        } catch (err) {
          console.error("Failed to load Pyodide:", err);
        } finally {
          setIsLoading(false);
        }
      };
      document.body.appendChild(script);
    };

    loadPyodideScript();
  }, []);

  const runCode = async () => {
    if (!pyodide) {
      setOutput("Error: Python runtime not loaded yet. Please wait...");
      return;
    }
    
    setIsRunning(true);
    setOutput("");
    setStatus("idle");

    try {
      // Setup output capture
      pyodide.runPython(`
        import sys
        import io
        sys.stdout = io.StringIO()
        sys.stderr = io.StringIO()
      `);

      // Run the user's code
      try {
        pyodide.runPython(code);
      } catch (err) {
        // Capture any runtime errors
        const stderr = pyodide.runPython("sys.stderr.getvalue()");
        if (stderr) {
          throw new Error(stderr);
        }
        throw err;
      }

      // Get the output
      const stdout = pyodide.runPython("sys.stdout.getvalue()");
      const stderr = pyodide.runPython("sys.stderr.getvalue()");
      
      const fullOutput = stderr ? `${stdout}\n${stderr}` : stdout;
      setOutput(fullOutput || "(No output)");

      if (expectedOutput) {
        // Normalize outputs (trim whitespace)
        const cleanOutput = stdout.trim();
        const cleanExpected = expectedOutput.trim();

        if (cleanOutput === cleanExpected) {
          setStatus("success");
          if (onSuccess) onSuccess();
        } else {
          setStatus("error");
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || String(err);
      setOutput(`Error: ${errorMessage}`);
      setStatus("error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-slate-900 text-white shadow-2xl ring-1 ring-slate-800">
      
      {/* Challenge Info Section */}
      {(challengeTitle || challengeDescription || expectedOutput) && (
        <div className="bg-slate-800/50 p-4 border-b border-slate-700 space-y-3">
          {challengeTitle && (
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {challengeTitle}
            </div>
          )}
          
          {challengeDescription && (
            <div className="text-slate-300 text-sm leading-relaxed">
              <span className="font-bold text-slate-200">Goal: </span>
              {challengeDescription}
            </div>
          )}

          {expectedOutput && (
            <div className="bg-slate-950/50 rounded p-3 border border-slate-800">
              <div className="text-xs font-mono text-slate-500 mb-1 uppercase">Expected Output:</div>
              <pre className="text-green-400/90 font-mono text-xs whitespace-pre-wrap">{expectedOutput}</pre>
            </div>
          )}
        </div>
      )}

      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          <span className="ml-2 text-xs font-mono text-slate-400">main.py</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => {
              setCode(initialCode);
              setOutput("");
              setStatus("idle");
            }}
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Reset
          </Button>
          <Button
            size="sm"
            className={`h-7 text-xs font-medium px-4 ${
              isLoading ? "bg-slate-700 text-slate-400" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
            } border-0 transition-all`}
            onClick={runCode}
            disabled={isLoading || isRunning}
          >
            {isRunning ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Play className="w-3 h-3 mr-1 fill-current" />
            )}
            {isLoading ? "Loading..." : "Run Code"}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative min-h-[250px] group">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full p-4 bg-slate-900 text-slate-100 font-mono text-sm resize-none focus:outline-none leading-relaxed selection:bg-blue-500/30"
          spellCheck={false}
          style={{ tabSize: 4 }}
        />
        <div className="absolute bottom-2 right-2 text-[10px] text-slate-600 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          Python 3.11 (Pyodide)
        </div>
      </div>

      {/* Output Area */}
      <div className="min-h-[120px] bg-black border-t border-slate-700 flex flex-col">
        <div className="px-4 py-1.5 bg-slate-950 border-b border-slate-800 text-[10px] font-mono flex justify-between items-center">
          <span className="text-slate-500">TERMINAL OUTPUT</span>
          {status === "success" && (
            <span className="text-green-400 flex items-center gap-1.5 bg-green-950/30 px-2 py-0.5 rounded-full border border-green-900/50">
              <CheckCircle className="w-3 h-3" /> Correct! Well done.
            </span>
          )}
          {status === "error" && (
            <span className="text-red-400 flex items-center gap-1.5 bg-red-950/30 px-2 py-0.5 rounded-full border border-red-900/50">
              <XCircle className="w-3 h-3" /> Output doesn&apos;t match expected result.
            </span>
          )}
        </div>
        <pre className={`flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap transition-colors ${
          status === 'error' ? 'text-red-300/90' : 'text-slate-300'
        }`}>
          {output || <span className="text-slate-700 italic">Click &quot;Run Code&quot; to see output...</span>}
        </pre>
      </div>
    </div>
  );
}
