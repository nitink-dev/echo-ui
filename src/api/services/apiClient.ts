import axios from "axios";
import { toast } from "sonner";
import { BASE_URL } from "../../utils/constants";

const activeToasts = new Set<string>();

function showErrorToast(message: string, toastId: string) {
  if (activeToasts.has(toastId)) return;

  activeToasts.add(toastId);
  toast.error(message, {
    id: toastId,
    onDismiss: () => activeToasts.delete(toastId),
    onAutoClose: () => activeToasts.delete(toastId),
  });
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.request.use((config) => {
  const xsrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (xsrfToken) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken);
  }

  return config;
});


let onUnauthorized: () => void = () => {};

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}


export function extractApiErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (data) {
      const serverMessage =
        data.message ||
        data.error ||
        data.errorDescription ||
        data.errorMessage;

      if (typeof serverMessage === "string") {
        return serverMessage;
      }
    }

    const HTTP_ERROR_MESSAGES: Record<number, string> = {
      400: "Bad request. Please check the submitted data.",
      403: "You do not have permission to perform this action.",
      404: "Requested resource not found.",
      408: "Request timed out. Please try again.",
      409: "Conflict detected. Please refresh and retry.",
      422: "Invalid data provided.",
      429: "Too many requests. Please try later.",
      500: "Internal server error. Please try again later.",
      502: "Bad gateway. Please try again later.",
      503: "Service temporarily unavailable.",
      504: "Gateway timeout. Please try again.",
    };

    if (status && HTTP_ERROR_MESSAGES[status]) {
      return HTTP_ERROR_MESSAGES[status];
    }

    if (!error.response && error.request) {
      return "Network error. Server unreachable.";
    }

    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }

    return `Unexpected error${status ? ` (${status})` : ""}.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}


apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    const url: string = error.config?.url ?? "unknown";

    const sourcePath = (
      url.startsWith("http") ? new URL(url).pathname : url
    )
      .replace(/^\/api\//, "")
      .split("?")[0];

    const isLoginRequest = sourcePath.includes("login");    

    if (isLoginRequest) {
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        showErrorToast(
          "Session expired. Please log in again.",
          "session-expired"
        );
        setTimeout(() => onUnauthorized(), 1500);
      }

      return Promise.reject(error);
    }

    if (error.request) {
      showErrorToast(
        "Network error — server unreachable. Please check your connection.",
        "network-error"
      );
      return Promise.reject(error);
    }

    if (error.code === "ECONNABORTED") {
      showErrorToast(
        "The request timed out. Please try again.",
        `timeout-${sourcePath}`
      );
      return Promise.reject(error);
    }

    showErrorToast(
      error.message || "An unexpected error occurred.",
      `unknown-${sourcePath}`
    );

    return Promise.reject(error);
  }
);

export default apiClient;
