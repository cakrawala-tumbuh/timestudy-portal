import { cn, formatDate, formatPercent, formatHours, dayColorLabel } from "@/lib/utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("px-4", "px-2")).toBe("px-2"); // tailwind-merge deduplication
    expect(cn(undefined, "bar")).toBe("bar");
  });
});

describe("formatPercent", () => {
  it("formats number to one decimal percentage", () => {
    expect(formatPercent(50)).toBe("50.0%");
    expect(formatPercent(100)).toBe("100.0%");
    expect(formatPercent(0)).toBe("0.0%");
  });
});

describe("formatHours", () => {
  it("returns dash for null/undefined", () => {
    expect(formatHours(null)).toBe("—");
    expect(formatHours(undefined)).toBe("—");
  });

  it("formats numeric hours", () => {
    expect(formatHours(8)).toBe("8.0 jam");
    expect(formatHours(7.5)).toBe("7.5 jam");
  });
});

describe("dayColorLabel", () => {
  it("returns correct labels", () => {
    expect(dayColorLabel("G").label).toBe("Normal");
    expect(dayColorLabel("Y").label).toBe("Sibuk");
    expect(dayColorLabel("R").label).toBe("Puncak");
  });

  it("returns default for unknown code", () => {
    expect(dayColorLabel("X").label).toBe("Normal");
  });
});

describe("formatDate", () => {
  it("returns a non-empty string for valid dates", () => {
    const result = formatDate("2024-01-15");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
