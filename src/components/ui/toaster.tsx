"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  // Return no-op during SSR or when Toaster is not mounted
  if (!context) {
    return {
      toasts: [],
      toast: (_toast: Omit<Toast, "id">) => {},
      dismiss: (_id: string) => {},
    };
  }
  return context;
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full transition-all",
              {
                "bg-white border-gray-200": t.variant === "default" || !t.variant,
                "bg-red-50 border-red-200 text-red-800": t.variant === "destructive",
                "bg-green-50 border-green-200 text-green-800": t.variant === "success",
              }
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                {t.title && <p className="font-semibold text-sm">{t.title}</p>}
                {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
