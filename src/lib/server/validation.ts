export interface ValidatedField {
  value: unknown;
  errors: string[];
}

export function validateString(value: unknown, field: string, options?: { required?: boolean; maxLength?: number }): string | null {
  if (options?.required && (!value || value === "")) {
    return `${field} is required`;
  }
  if (value !== null && value !== undefined && typeof value !== "string") {
    return `${field} must be a string`;
  }
  if (options?.maxLength && typeof value === "string" && value.length > options.maxLength) {
    return `${field} exceeds maximum length of ${options.maxLength}`;
  }
  return null;
}

export function validateNumber(value: unknown, field: string, options?: { min?: number; max?: number }): string | null {
  if (typeof value !== "number" || isNaN(value)) {
    return `${field} must be a number`;
  }
  if (options?.min !== undefined && value < options.min) {
    return `${field} must be at least ${options.min}`;
  }
  if (options?.max !== undefined && value > options.max) {
    return `${field} must be at most ${options.max}`;
  }
  return null;
}

export function validateLink(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "Link is required";
  }
  try {
    new URL(value.trim());
    return null;
  } catch {
    if (/^\d{9,15}$/.test(value.trim().replace(/\s+/g, ""))) {
      return null;
    }
    return "Link must be a valid URL or phone number";
  }
}

export function sanitizeString(value: unknown, maxLength: number = 1000): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return String(value).slice(0, maxLength);
  return value.slice(0, maxLength);
}
