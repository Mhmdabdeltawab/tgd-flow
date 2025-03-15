import { useToastStore } from "../stores/toastStore";

interface ErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

class ErrorService {
  private static instance: ErrorService;

  private constructor() {
    this.setupGlobalHandlers();
  }

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  private setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason instanceof Error) {
        event.preventDefault();
        this.handleError(event.reason);
      }
    });

    // Handle uncaught errors
    window.addEventListener("error", (event) => {
      if (event.error instanceof Error) {
        event.preventDefault();
        this.handleError(event.error);
      }
    });
  }

  public handleError(error: any) {
    const { addToast } = useToastStore.getState();

    // Log error details for debugging
    console.group("Error Details");
    console.error("Error:", error);
    console.error("Stack:", error?.stack);
    console.groupEnd();

    // Format the error message
    const errorMessage = this.formatErrorMessage(error);

    // Show toast notification
    addToast({
      type: "error",
      message: errorMessage,
    });

    // Track error for analytics
    this.trackError(error);
  }

  private trackError(error: any) {
    // TODO: Implement error tracking/analytics
    // This could integrate with services like Sentry, LogRocket, etc.
  }

  private formatErrorMessage(error: any): string {
    // If it's our custom error response format
    if (this.isErrorResponse(error)) {
      return error.message;
    }

    // If it's an axios error
    if (error?.response?.data) {
      const message = error.response.data.message;
      const status = error.response.status;
      return message || `Server error (${status})`;
    }

    // If it's a regular Error object
    if (error instanceof Error) {
      return error.message || "An unexpected error occurred";
    }

    // If it's a string
    if (typeof error === "string") {
      return error;
    }

    // Default error message
    return "An unexpected error occurred";
  }

  private isErrorResponse(error: any): error is ErrorResponse {
    return error && typeof error.message === "string";
  }

  public createError(
    message: string,
    code?: string,
    details?: Record<string, any>,
  ): ErrorResponse {
    return { message, code, details };
  }
}

export const errorService = ErrorService.getInstance();

// Custom hook for error handling
export function useError() {
  return {
    handleError: (error: any) => errorService.handleError(error),
    createError: (
      message: string,
      code?: string,
      details?: Record<string, any>,
    ) => errorService.createError(message, code, details),
  };
}
