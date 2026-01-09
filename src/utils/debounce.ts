/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last invocation.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>): void => {
    lastArgs = args;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (lastArgs !== null) {
        func(...lastArgs);
        lastArgs = null;
      }
      timeoutId = null;
    }, wait);
  };

  debounced.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  debounced.flush = (): void => {
    if (timeoutId !== null && lastArgs !== null) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      lastArgs = null;
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per specified time period.
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs !== null) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

