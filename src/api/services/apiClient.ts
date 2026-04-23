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
  headers: { "Content-Type": "application/json" },
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
  // Preserved from old file: handle plain string errors early
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status: number | undefined = error.response?.status;
    const data = error.response?.data;

    if (data) {
      // Preserved from old file: includes errorMessage field in addition to the new file's fields
      const serverMessage =
        data.message ||
        data.error ||
        data.errorDescription ||
        data.errorMessage ||
        null;
      if (serverMessage && typeof serverMessage === "string") return serverMessage;
    }

    const HTTP_ERROR_MESSAGES: Record<number, string> = {
      400: "Bad request. Please check the data you submitted.",
      403: "You don't have permission to perform this action.",
      404: "The requested resource was not found.",
      408: "The request timed out. Please try again.",
      409: "A conflict occurred. The resource may already exist.",
      422: "The submitted data is invalid or could not be processed.",
      429: "Too many requests. Please slow down and try again later.",
      500: "An internal server error occurred. Please try again later.",
      502: "The server received an invalid response from an upstream service.",
      503: "The service is temporarily unavailable. Please try again shortly.",
      504: "Gateway timeout. Please try again.",
    };

    if (status && HTTP_ERROR_MESSAGES[status]) {
      return HTTP_ERROR_MESSAGES[status];
    }

    if (!error.response && error.request) {
      return "Network error — server unreachable. Please check your connection.";
    }

    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }

    return `Unexpected error${status ? ` (${status})` : ""}.`;
  }

  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    const url: string = error.config?.url ?? "unknown";

    const sourcePath = (url.startsWith("http") ? new URL(url).pathname : url)
      .replace(/^\/api\//, "")
      .split("?")[0];

    const isLoginRequest =
      sourcePath === "login" || sourcePath === "auth/login";

    if (error.response) {
      const status: number = error.response.status;

      if (isLoginRequest) {
        return Promise.reject(error);
      }

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