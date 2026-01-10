export function debounce(func: (...args: any[]) => any, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: any[]) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}
