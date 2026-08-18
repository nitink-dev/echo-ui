import { describe, expect, it } from "vitest";
import { formatSessionClockTime, formatSessionDuration } from "../sessionTime";

describe("sessionTime", () => {
  it("formats a clock time as HH:MM:SS", () => {
    expect(formatSessionClockTime(new Date(2024, 0, 1, 1, 2, 3))).toBe("01:02:03");
  });

  it("formats short durations as MM:SS", () => {
    expect(formatSessionDuration(2325)).toBe("38:45");
  });

  it("formats longer durations as HH:MM:SS", () => {
    expect(formatSessionDuration(3661)).toBe("01:01:01");
  });
});
