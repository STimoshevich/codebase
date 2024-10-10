export const lazyInstance = <T extends Record<string, any>>(factory: () => T) => {
  let isInitialized = false;
  let instance: T;

  return new Proxy<T>({} as T, {
    get(_, prop: string) {
      if (!isInitialized) {
        instance = factory();
        isInitialized = true;
      }

      return instance[prop];
    },
  });
};
