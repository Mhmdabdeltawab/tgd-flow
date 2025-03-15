import { useToastStore } from "../stores/toastStore";

export type ToastType = "success" | "error" | "info" | "warning";

// Create a singleton instance to avoid state updates during render
const toastStore = useToastStore.getState();

export function useToast() {
  const toast = {
    success: (message: string) =>
      toastStore.addToast({ type: "success", message }),
    error: (message: string) => toastStore.addToast({ type: "error", message }),
    info: (message: string) => toastStore.addToast({ type: "info", message }),
    warning: (message: string) =>
      toastStore.addToast({ type: "warning", message }),
    showToast: (toast: {
      type: ToastType;
      title?: string;
      message: string;
    }) => {
      toastStore.addToast({ type: toast.type, message: toast.message });
    },
  };

  return toast;
}
