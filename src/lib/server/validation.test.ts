import { describe, it, expect } from "vitest";
import { validateString, validateNumber, validateLink, sanitizeString } from "@/lib/server/validation";

describe("validateString", () => {
  it("returns 'field is required' for empty string when required", () => {
    expect(validateString("", "username", { required: true })).toBe("username is required");
  });

  it("returns 'field is required' for null when required", () => {
    expect(validateString(null, "username", { required: true })).toBe("username is required");
  });

  it("returns error for non-string values", () => {
    expect(validateString(42, "username")).toBe("username must be a string");
  });

  it("returns error when exceeding maxLength", () => {
    expect(validateString("hello world", "bio", { maxLength: 5 })).toBe("bio exceeds maximum length of 5");
  });

  it("returns null for valid string", () => {
    expect(validateString("hello", "username")).toBeNull();
  });

  it("returns null for undefined when not required", () => {
    expect(validateString(undefined, "username")).toBeNull();
  });
});

describe("validateNumber", () => {
  it("returns error for non-number values", () => {
    expect(validateNumber("100", "amount")).toBe("amount must be a number");
  });

  it("returns error for NaN", () => {
    expect(validateNumber(NaN, "amount")).toBe("amount must be a number");
  });

  it("returns error when below minimum", () => {
    expect(validateNumber(50, "amount", { min: 100 })).toBe("amount must be at least 100");
  });

  it("returns error when above maximum", () => {
    expect(validateNumber(500, "amount", { max: 100 })).toBe("amount must be at most 100");
  });

  it("returns null for valid number within range", () => {
    expect(validateNumber(50, "amount", { min: 1, max: 100 })).toBeNull();
  });

  it("returns null for 0 when not required and no min", () => {
    expect(validateNumber(0, "amount")).toBeNull();
  });
});

describe("validateLink", () => {
  it("returns 'Link is required' for empty string", () => {
    expect(validateLink("")).toBe("Link is required");
  });

  it("returns 'Link is required' for whitespace only", () => {
    expect(validateLink("   ")).toBe("Link is required");
  });

  it("returns null for valid URL", () => {
    expect(validateLink("https://twitter.com/username")).toBeNull();
  });

  it("returns null for valid phone number (digits only)", () => {
    expect(validateLink("254712345678")).toBeNull();
  });

  it("returns error for invalid string that is not URL or phone", () => {
    expect(validateLink("not-a-link")).toBe("Link must be a valid URL or phone number");
  });
});

describe("sanitizeString", () => {
  it("returns null for null input", () => {
    expect(sanitizeString(null, 100)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(sanitizeString(undefined, 100)).toBeNull();
  });

  it("truncates string to maxLength", () => {
    expect(sanitizeString("hello world", 5)).toBe("hello");
  });

  it("converts non-string to string and truncates", () => {
    expect(sanitizeString(42, 3)).toBe("42");
  });

  it("returns full string when under maxLength", () => {
    expect(sanitizeString("hello", 100)).toBe("hello");
  });

  it("uses default maxLength of 1000 when not specified", () => {
    const long = "a".repeat(2000);
    expect(sanitizeString(long)).toHaveLength(1000);
  });
});
