"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Play, RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface PythonPlaygroundProps {
  initialCode: string;
  expectedOutput?: string;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export default function PythonPlayground({ initialCode, expectedOutput, onSuccess }: PythonPlaygroundProps) {
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
    if (!pyodide) return;
    setIsRunning(true);
    setOutput("");
    setStatus("idle");

    try {
      // Redirect stdout to capture print statements
      pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      await pyodide.runPythonAsync(code);

      const stdout = pyodide.runPython("sys.stdout.getvalue()");
      setOutput(stdout);

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
      setOutput(`Error: ${err.message}`);
      setStatus("error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-slate-900 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-sm font-mono text-slate-400">main.py</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-slate-400 hover:text-white"
            onClick={() => {
              setCode(initialCode);
              setOutput("");
              setStatus("idle");
            }}
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Reset
          </Button>
          <Button
            size="sm"
            className={`h-8 ${
              isLoading ? "bg-slate-600" : "bg-green-600 hover:bg-green-700"
            } text-white border-0`}
            onClick={runCode}
            disabled={isLoading || isRunning}
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Play className="w-4 h-4 mr-1" />
            )}
            {isLoading ? "Loading Python..." : "Run Code"}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative min-h-[300px]">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full p-4 bg-slate-900 text-slate-100 font-mono text-sm resize-none focus:outline-none leading-relaxed"
          spellCheck={false}
          style={{ tabSize: 4 }}
        />
      </div>

      {/* Output Area */}
      <div className="h-1/3 min-h-[150px] bg-black border-t border-slate-700 flex flex-col">
        <div className="px-4 py-1 bg-slate-800 text-xs text-slate-400 font-mono flex justify-between items-center">
          <span>TERMINAL OUTPUT</span>
          {status === "success" && (
            <span className="text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Passed
            </span>
          )}
          {status === "error" && (
            <span className="text-red-400 flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Failed
            </span>
          )}
        </div>
        <pre className="flex-1 p-4 font-mono text-sm text-green-400 overflow-auto whitespace-pre-wrap">
          {output || <span className="text-slate-600 italic">Run code to see output...</span>}
        </pre>
      </div>
    </div>
  );
}
