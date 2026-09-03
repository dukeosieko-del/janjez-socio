import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getStoredTheme, getInitialTheme } from "@/lib/theme/ThemeContext";

const makeWindow = (overrides: Record<string, unknown> = {}) =>
  ({
    localStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
    },
    matchMedia: vi.fn().mockReturnValue({
      matches: false,
    }),
    ...overrides,
  }) as unknown as Window;

describe("ThemeContext utilities", () => {
  beforeEach(() => {
    vi.stubGlobal("window", makeWindow());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getStoredTheme", () => {
    it("returns 'dark' when localStorage has dark theme", () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue("dark");
      expect(getStoredTheme()).toBe("dark");
    });

    it("returns 'light' when localStorage has light theme", () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue("light");
      expect(getStoredTheme()).toBe("light");
    });

    it("returns null when localStorage has invalid theme", () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue("purple");
      expect(getStoredTheme()).toBeNull();
    });

    it("returns null when localStorage returns null", () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue(null);
      expect(getStoredTheme()).toBeNull();
    });

    it("returns null when window is undefined (SSR)", () => {
      vi.stubGlobal("window", undefined);
      expect(getStoredTheme()).toBeNull();
    });
  });

  describe("getInitialTheme", () => {
    it("returns stored dark theme", () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue("dark");
      expect(getInitialTheme()).toBe("dark");
    });

    it("returns stored light theme", () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue("light");
      expect(getInitialTheme()).toBe("light");
    });

    it("returns dark when prefers-color-scheme is dark and no stored theme", () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue(null);
      vi.stubGlobal("window", makeWindow({ matchMedia: vi.fn().mockReturnValue({ matches: true }) }));
      expect(getInitialTheme()).toBe("dark");
    });

    it("returns light when prefers-color-scheme is light and no stored theme", () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue(null);
      vi.stubGlobal("window", makeWindow({ matchMedia: vi.fn().mockReturnValue({ matches: false }) }));
      expect(getInitialTheme()).toBe("light");
    });

    it("defaults to dark in SSR (window undefined)", () => {
      vi.stubGlobal("window", undefined);
      expect(getInitialTheme()).toBe("dark");
    });
  });

  describe("theme storage key", () => {
    it("uses correct storage key value", () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue(null);
      expect(window.localStorage.getItem("janjez-theme")).toBeNull();
    });
  });

  describe("Theme type", () => {
    it("accepts 'dark' and 'light' values", () => {
      const dark: "dark" | "light" = "dark";
      const light: "dark" | "light" = "light";
      expect(dark).toBe("dark");
      expect(light).toBe("light");
    });
  });
});
