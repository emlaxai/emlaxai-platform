import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/ui/useDebounce';

describe('useDebounce', () => {
  it('başlangıç değerini hemen döndürür', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('delay sonrası güncellenen değeri döndürür', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    );

    rerender({ value: 'world', delay: 500 });
    expect(result.current).toBe('hello');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('world');
    vi.useRealTimers();
  });

  it('delay içinde tekrar değişirse sadece son değeri alır', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: 'c', delay: 300 });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: 'd', delay: 300 });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe('d');
    vi.useRealTimers();
  });
});
