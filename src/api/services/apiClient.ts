import axios from "axios";
import { toast } from "sonner";
import { BASE_URL } from "../../utils/constants";

const activeToasts = new Set<string>();

function showErrorToast(message: string, toastId: string) {
  if (activeToasts.has(toastId)) return; // already visible hai

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

// REQUEST INTERCEPTOR
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

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    // ── Source tag: URL se component identify karo ─────────────────────────
    const url = error.config?.url ?? "unknown";

    // e.g. "/api/scanners" → "scanners" , "/api/auth/login" → "auth/login"
    //const sourcePath = url.replace(/^\/api\//, "").split("?")[0];
    
const sourcePath = (url.startsWith("http") ? new URL(url).pathname : url)
  .replace(/^\/api\//, "")
  .split("?")[0];


    if (error.response) {
      const status: number = error.response.status;

      const serverMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        error.response.data?.errorDescription ||
        null;

      const baseMessage =
        serverMessage ||
        HTTP_ERROR_MESSAGES[status] ||
        `Unexpected error (${status}).`;

      // Toast ID = status + endpoint to prevent duplicates for same error type
      const toastId = `${status}-${sourcePath}`;
      const displayMessage = `[${sourcePath}] ${baseMessage}`;

      showErrorToast(displayMessage, toastId);

    } else if (error.request) {
      // Network error 
      showErrorToast(
        "Network error — server unreachable. Please check your connection.",
        "network-error"  
      );
    } else if (error.code === "ECONNABORTED") {
      showErrorToast("The request timed out. Please try again.", `timeout-${sourcePath}`);
    } else {
      showErrorToast(error.message || "An unexpected error occurred.", `unknown-${sourcePath}`);
    }

    console.error(`API Error [${sourcePath}]:`, error);
    return Promise.reject(error);
  }
);

export default apiClient;