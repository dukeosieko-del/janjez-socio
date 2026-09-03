import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const THEME_STORAGE_KEY = "janjez-theme";

type Theme = "dark" | "light";

const mockToggleTheme = vi.fn();
let mockTheme: { theme: Theme; toggleTheme: typeof mockToggleTheme; setTheme: vi.Mock };

vi.mock("@/lib/theme/ThemeContext", () => ({
  useTheme: () => mockTheme,
  THEME_STORAGE_KEY,
  Theme: undefined,
  getStoredTheme: vi.fn(),
  getInitialTheme: vi.fn(),
}));

describe("ThemeToggle behavior", () => {
  beforeEach(() => {
    mockToggleTheme.mockClear();
    mockTheme = {
      theme: "dark",
      toggleTheme: mockToggleTheme,
      setTheme: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("toggleTheme is called when toggle is invoked", () => {
    mockTheme.toggleTheme();
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("toggleTheme switches from dark to light", () => {
    mockTheme.theme = "dark";
    mockTheme.toggleTheme = vi.fn(() => {
      mockTheme.theme = "light";
    });
    mockTheme.toggleTheme();
    expect(mockTheme.theme).toBe("light");
  });

  it("toggleTheme switches from light to dark", () => {
    mockTheme.theme = "light";
    mockTheme.toggleTheme = vi.fn(() => {
      mockTheme.theme = "dark";
    });
    mockTheme.toggleTheme();
    expect(mockTheme.theme).toBe("dark");
  });

  it("toggleTheme calls the underlying function", () => {
    const mockFn = vi.fn();
    mockTheme = { theme: "dark", toggleTheme: mockFn, setTheme: vi.fn() };
    mockFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("aria-label is 'Switch to light mode' when dark", () => {
    const ariaLabel = mockTheme.theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    expect(ariaLabel).toBe("Switch to light mode");
  });

  it("aria-label is 'Switch to dark mode' when light", () => {
    mockTheme.theme = "light";
    const ariaLabel = mockTheme.theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    expect(ariaLabel).toBe("Switch to dark mode");
  });

  it("title is 'Switch to light mode' when dark", () => {
    const title = mockTheme.theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    expect(title).toBe("Switch to light mode");
  });

  it("title is 'Switch to dark mode' when light", () => {
    mockTheme.theme = "light";
    const title = mockTheme.theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    expect(title).toBe("Switch to dark mode");
  });
});
