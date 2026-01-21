import { useState, useCallback } from "react";
import type { ToastType } from "@/components/Toast";

export interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

/**
 * Hook para gerenciar exibição de Toast notifications
 * Facilita a exibição de mensagens de feedback visual
 */
export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    type: "info",
  });

  const show = useCallback(
    (message: string, type: ToastType = "info", duration: number = 3000) => {
      setToast({
        visible: true,
        message,
        type,
      });

      // Auto-dismiss após duration
      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return timer;
    },
    [],
  );

  const dismiss = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => show(message, "success", duration),
    [show],
  );

  const error = useCallback(
    (message: string, duration?: number) => show(message, "error", duration),
    [show],
  );

  const warning = useCallback(
    (message: string, duration?: number) => show(message, "warning", duration),
    [show],
  );

  const info = useCallback(
    (message: string, duration?: number) => show(message, "info", duration),
    [show],
  );

  return {
    toast,
    show,
    dismiss,
    success,
    error,
    warning,
    info,
  };
}
