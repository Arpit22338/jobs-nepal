"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, XCircle, AlertCircle, Info, Check } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
type ConfirmType = "danger" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: "bg-green-500/20 border-green-500/50 text-green-400",
  error: "bg-red-500/20 border-red-500/50 text-red-400",
  warning: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
  info: "bg-blue-500/20 border-blue-500/50 text-blue-400",
};

const iconColorMap = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  info: "text-blue-400",
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = iconMap[toast.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-5 fade-in duration-300 pointer-events-auto ${colorMap[toast.type]}`}
    >
      {toast.type === "success" ? (
        <div className="w-6 h-6 shrink-0 bg-green-500 rounded-full flex items-center justify-center animate-[bounce-in_0.4s_ease-out]">
          <Check className="w-4 h-4 text-white animate-[scale-in_0.3s_ease-out_0.1s_both]" strokeWidth={3} />
        </div>
      ) : (
        <Icon className={`w-5 h-5 shrink-0 ${iconColorMap[toast.type]}`} />
      )}
      <p className="text-sm font-medium text-foreground flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmOptions | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "info", duration: number = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmDialog(options);
  }, []);

  const handleConfirm = async () => {
    if (confirmDialog?.onConfirm) {
      await confirmDialog.onConfirm();
    }
    setConfirmDialog(null);
  };

  const handleCancel = () => {
    if (confirmDialog?.onCancel) {
      confirmDialog.onCancel();
    }
    setConfirmDialog(null);
  };

  const buttonColors = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    info: "bg-primary hover:bg-primary/90",
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, showConfirm }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-100 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
          />
          <div className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <h3 className="text-xl font-bold text-foreground mb-2">{confirmDialog.title}</h3>
            <p className="text-muted-foreground mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
              >
                {confirmDialog.cancelText || "Cancel"}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-xl text-white font-medium transition-colors ${buttonColors[confirmDialog.type || "info"]}`}
              >
                {confirmDialog.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// Custom confirm dialog - keeping for backwards compatibility
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const buttonColors = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    info: "bg-primary hover:bg-primary/90",
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white font-medium transition-colors ${buttonColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Certificate validation result component
interface CertificateValidationProps {
  isOpen: boolean;
  isValid: boolean;
  courseName?: string;
  onClose: () => void;
}

export function CertificateValidation({
  isOpen,
  isValid,
  courseName,
  onClose,
}: CertificateValidationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 fade-in duration-200 text-center">
        {isValid ? (
          <>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle className="w-12 h-12 text-green-500 animate-in spin-in-180 duration-700" />
            </div>
            <h3 className="text-2xl font-bold text-green-500 mb-2">Certificate Valid!</h3>
            {courseName && (
              <p className="text-foreground font-medium">Course: {courseName}</p>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center animate-in zoom-in duration-500">
              <XCircle className="w-12 h-12 text-red-500 animate-in spin-in-180 duration-700" />
            </div>
            <h3 className="text-2xl font-bold text-red-500 mb-2">Certificate Not Valid</h3>
            <p className="text-muted-foreground">This certificate ID does not exist in our records.</p>
          </>
        )}
        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
