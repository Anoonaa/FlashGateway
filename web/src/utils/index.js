/**
 * UTILITY FUNCTIONS
 * Common formatting, API, and data manipulation utilities
 */

const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:4001`;

/**
 * Format currency values in ZAR with proper localization
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "R 0.00";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Format numbers with proper thousand separators
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "0";
  return new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value));
}

/**
 * Format relative time (e.g., "2h ago", "Just now")
 */
export function formatRelativeTime(date) {
  if (!date) return "Just now";

  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();

  if (diff < 60000) return "Just now";

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  return target.toLocaleDateString("en-ZA");
}

/**
 * Format date for display
 */
export function formatDate(date, format = "short") {
  if (!date) return "";

  const d = new Date(date);
  const options = {
    short: { year: "numeric", month: "2-digit", day: "2-digit" },
    long: { year: "numeric", month: "long", day: "numeric" },
    time: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  };

  return d.toLocaleDateString("en-ZA", options[format] || options.short);
}

/**
 * Format time duration
 */
export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Get status tone/color semantic meaning
 */
export function getStatusTone(status) {
  const tones = {
    completed: "success",
    approved: "success",
    pending: "warning",
    processing: "info",
    rejected: "danger",
    cancelled: "danger",
    failed: "danger",
    inactive: "warning",
  };
  return tones[status?.toLowerCase()] || "neutral";
}

/**
 * Get status icon name (Material Symbols)
 */
export function getStatusIcon(status) {
  const icons = {
    completed: "check_circle",
    approved: "verified",
    pending: "schedule",
    processing: "sync",
    rejected: "cancel",
    cancelled: "highlight_off",
    failed: "error",
    inactive: "pause_circle",
  };
  return icons[status?.toLowerCase()] || "info";
}

/**
 * Fetch with JSON support and error handling
 */
export async function fetchJson(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  // Development mock support for auth endpoints
  if (USE_MOCK) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    if (path === "/api/v1/auth/login") {
      await sleep(200);
      const body = options.body ? JSON.parse(options.body) : {};
      const email = body.email || "merchant@flashgateway.local";
      return {
        token: "demo-token-123",
        user: {
          name: "FlashGateway Merchant",
          full_name: "FlashGateway Merchant",
          email,
          merchantId: "merchant-123",
        },
      };
    }

    if (path === "/api/v1/auth/register") {
      await sleep(200);
      const body = options.body ? JSON.parse(options.body) : {};
      return { message: `Account created for ${body.email || "demo"}` };
    }
  }

  try {
    // Attach Authorization header if session token exists
    const stored = (() => {
      try {
        const s = window.localStorage.getItem("flashgateway-session");
        return s ? JSON.parse(s) : null;
      } catch {
        return null;
      }
    })();

    const authHeaders =
      stored && stored.token ? { Authorization: `Bearer ${stored.token}` } : {};

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...authHeaders,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        payload?.message ||
        (typeof payload === "string"
          ? payload
          : `HTTP ${response.status}: ${response.statusText}`);
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Network error - unable to connect to server");
    }
    throw error;
  }
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number (South African format)
 */
export function isValidPhoneNumber(phone) {
  const re = /^(\+27|0)[0-9]{9}$/;
  return re.test(phone?.replace(/\s/g, ""));
}

/**
 * Validate currency amount
 */
export function isValidAmount(amount) {
  const num = Number(amount);
  return !Number.isNaN(num) && num > 0 && num <= 999999999.99;
}

/**
 * Generate initials from name
 */
export function getInitials(fullName) {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, length = 50) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

/**
 * Deep merge objects
 */
export function mergeDeep(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

/**
 * Check if value is an object
 */
export function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * Debounce function execution
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Parse query string parameters
 */
export function parseQueryString(search = window.location.search) {
  const params = new URLSearchParams(search);
  const result = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Build query string from object
 */
export function buildQueryString(params) {
  return new URLSearchParams(params).toString();
}
