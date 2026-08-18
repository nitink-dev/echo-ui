import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useIdleTimeout } from "../useIdleTimeout";

describe("useIdleTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("refreshes the timer when activity occurs", () => {
    const onActivity = vi.fn();
    const onAutoLogout = vi.fn();

    const { result } = renderHook(() =>
      useIdleTimeout({
        sessionTimeoutMinutes: 6,
        onAutoLogout,
        onActivity,
      })
    );

    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    expect(onActivity).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalled();
    expect(result.current.isIdle).toBe(false);
  });
});
