export function throttle(func: (...args:any[]) => any, limit: number) {
  let inThrottle = false;
  return function (this: unknown, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
