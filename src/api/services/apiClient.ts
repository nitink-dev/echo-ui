import axios from "axios";
import { toast } from "sonner";
import { BASE_URL } from "../../utils/constants";

const apiClient = axios.create({
  baseURL: BASE_URL || "",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  // 4xx Client Errors
  400: "Bad request. Please check the data you submitted.",
  401: "You are not authenticated. Please log in and try again.",
  402: "Payment required. Please update your billing details.",
  403: "Access denied. You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  405: "This action is not allowed on the requested resource.",
  406: "The server cannot produce a response in the requested format.",
  407: "Proxy authentication is required.",
  408: "The request timed out. Please try again.",
  409: "A conflict occurred. The resource may already exist.",
  410: "The requested resource is no longer available.",
  411: "Request is missing required content length.",
  412: "A precondition for this request was not met.",
  413: "The data you are trying to upload is too large.",
  414: "The request URL is too long.",
  415: "The uploaded file type is not supported.",
  416: "The requested data range cannot be fulfilled.",
  417: "The server could not meet the request expectation.",
  418: "Unexpected server response.", // I'm a teapot — kept generic
  422: "The submitted data is invalid or could not be processed.",
  423: "The resource is locked and cannot be modified right now.",
  424: "This request depends on another request that failed.",
  425: "The server is not ready to process this request yet.",
  426: "Please upgrade your connection protocol to continue.",
  428: "A precondition is required for this request.",
  429: "Too many requests. Please slow down and try again later.",
  431: "The request headers are too large.",
  451: "This resource is unavailable for legal reasons.",

  // 5xx Server Errors
  500: "An internal server error occurred. Please try again later.",
  501: "This feature is not yet implemented on the server.",
  502: "The server received an invalid response from an upstream service.",
  503: "The service is temporarily unavailable. Please try again shortly.",
  504: "The server did not receive a timely response from an upstream service.",
  505: "The HTTP version used in the request is not supported.",
  506: "The server has a configuration error (variant negotiation).",
  507: "The server has insufficient storage to complete the request.",
  508: "An infinite loop was detected while processing the request.",
  510: "Further extensions are required to fulfill this request.",
  511: "Network authentication is required to access this resource.",
};

// RESPONSE INTERCEPTOR (GLOBAL ERROR HANDLER)
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    let message = "Something went wrong. Please try again.";

    if (error.response) {
      const status: number = error.response.status;

      // Prefer a specific message from the server payload if available
      const serverMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        null;

      message = serverMessage || HTTP_ERROR_MESSAGES[status] || `Unexpected error (${status}). Please contact support.`;
    } else if (error.request) {
      message = "Network error. Please check your internet connection.";
    } else if (error.code === "ECONNABORTED") {
      message = "The request timed out. Please try again.";
    } else {
      message = error.message || "An unexpected error occurred.";
    }

    toast.error(message);
    console.error("API Error:", error);

    return Promise.reject(error);
  }
);

export default apiClient;