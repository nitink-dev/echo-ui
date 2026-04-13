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

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: "Bad request. Please check the data you submitted.",
  401: "You are not authenticated. Please log in and try again.",
  403: "Access denied. You don't have permission to perform this action.",
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

const LOGIN_PATH = "/login"; 

let onUnauthorized: () => void = () => {};

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    const url = error.config?.url ?? "unknown";

    const sourcePath = (url.startsWith("http") ? new URL(url).pathname : url)
      .replace(/^\/api\//, "")
      .split("?")[0];

    if (error.response) {
      const status: number = error.response.status;

      if (status === 401) {
        showErrorToast("Session expired. Please log in again.", "session-expired");
        setTimeout(() => {
          onUnauthorized();
        }, 1500); // toast dikhne ka time
        return Promise.reject(error);
      }

      const serverMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        error.response.data?.errorDescription ||
        null;

      const baseMessage =
        serverMessage ||
        HTTP_ERROR_MESSAGES[status] ||
        `Unexpected error (${status}).`;

      const toastId = `${status}-${sourcePath}`;
      const displayMessage = `[${sourcePath}] ${baseMessage}`;

      showErrorToast(displayMessage, toastId);

    } else if (error.request) {
      showErrorToast(
        "Network error — server unreachable. Please check your connection.",
        "network-error"
      );
    } else if (error.code === "ECONNABORTED") {
      showErrorToast("The request timed out. Please try again.", `timeout-${sourcePath}`);
    } else {
      showErrorToast(error.message || "An unexpected error occurred.", `unknown-${sourcePath}`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;