export type AnonymousClass<T> = new (...args: any[]) => {} & T;
