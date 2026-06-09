import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should return the updated value after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Initial value
    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Should still be old value

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset the timer when value changes before delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    expect(result.current).toBe('first');

    // Change value before timer expires
    rerender({ value: 'second' });
    act(() => {
      vi.advanceTimersByTime(300); // Not enough time
    });
    expect(result.current).toBe('first'); // Should still be first value

    // Wait for full delay
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('second');
  });

  it('should handle rapid successive changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'v1' } }
    );

    expect(result.current).toBe('v1');

    // Rapid changes
    rerender({ value: 'v2' });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('v1');

    rerender({ value: 'v3' });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('v1');

    rerender({ value: 'v4' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('v4');
  });

  it('should work with different data types', () => {
    // Numbers
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 42 } }
    );
    expect(numberResult.current).toBe(42);
    numberRerender({ value: 100 });
    act(() => vi.advanceTimersByTime(200));
    expect(numberResult.current).toBe(100);

    // Booleans
    const { result: boolResult, rerender: boolRerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: false } }
    );
    expect(boolResult.current).toBe(false);
    boolRerender({ value: true });
    act(() => vi.advanceTimersByTime(200));
    expect(boolResult.current).toBe(true);

    // Objects
    const obj1 = { id: 1, name: 'test' };
    const obj2 = { id: 2, name: 'updated' };
    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: obj1 } }
    );
    expect(objResult.current).toBe(obj1);
    objRerender({ value: obj2 });
    act(() => vi.advanceTimersByTime(200));
    expect(objResult.current).toBe(obj2);
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'start', delay: 1000 } }
    );

    expect(result.current).toBe('start');

    rerender({ value: 'changed', delay: 1000 });
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('start'); // Not yet updated

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('changed');
  });

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useDebounce('test', 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });

    // With zero delay, should update immediately (next tick)
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toBe('updated');
  });
});