// ─── Shared Validation Constants ─────────────────────────────────────────────
// Single source of truth for IP, Port, Email, and field-specific rules.
// Import from this file in LisConfig, SynapseConfig, EnrichmentToolConfig etc.

// ── Safe string coercion ──────────────────────────────────────────────────────
// Converts any value (number, undefined, null) to a trimmed string safely.
// This prevents "v.trim is not a function" when form values come in as
// numbers (e.g. port from API) or undefined/null.
const safeStr = (v: unknown): string => String(v ?? "").trim();

// ── IP ────────────────────────────────────────────────────────────────────────
// Allowed chars while typing: digits, dots (IPv4) + hex letters + colons (IPv6)
export const IP_ALLOWED_PATTERN = /^[0-9a-fA-F.:]*$/;

// Full IPv4: 0-255 . 0-255 . 0-255 . 0-255
const IPV4_REGEX =
  /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

// Full IPv6: 8 groups of 1-4 hex digits separated by colons,
// with support for :: shorthand and mixed IPv4-mapped addresses
const IPV6_REGEX =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,5}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d)|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))$/;

export const isValidIP = (v: unknown): boolean => {
  const s = safeStr(v);
  return IPV4_REGEX.test(s) || IPV6_REGEX.test(s);
};

export const IP_ERROR_MESSAGE =
  "Enter a valid IPv4 (e.g. 192.168.1.1) or IPv6 (e.g. 2001:db8::1) address";

// ── Port ──────────────────────────────────────────────────────────────────────
export const PORT_ALLOWED_PATTERN = /^\d*$/;

export const PORT_VALID_PATTERN =
  /^([1-9]\d{0,4}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;

export const isValidPort = (v: unknown): boolean =>
  PORT_VALID_PATTERN.test(safeStr(v));

export const PORT_ERROR_MESSAGE = "Port must be a number between 1 and 65535";

// ── Email ─────────────────────────────────────────────────────────────────────
export const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export const isValidEmail = (v: unknown): boolean =>
  EMAIL_REGEX.test(safeStr(v));

export const EMAIL_ERROR_MESSAGE =
  "Enter a valid email address (e.g. user@example.com)";

// ── Generic field rule type ───────────────────────────────────────────────────
export interface FieldRule {
  label: string;
  allowedPattern: RegExp;          // chars allowed while typing / pasting
  validPattern?: RegExp;           // optional regex for full-value check
  validate?: (v: unknown) => boolean; // custom validator (overrides validPattern)
  errorMessage: string;
  required?: boolean;
}

// ── Helper: sanitize a string to only allowed chars ───────────────────────────
export const sanitizeByPattern = (value: unknown, pattern: RegExp): string =>
  safeStr(value)
    .split("")
    .filter((ch) => pattern.test(ch))
    .join("");