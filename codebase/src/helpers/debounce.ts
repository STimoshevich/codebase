function debounce<T extends Function>(delay: number) {
  let timeout: any;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const context = this;

      // Clear the previous timeout
      clearTimeout(timeout);

      // Set a new timeout
      timeout = setTimeout(() => {
        originalMethod.apply(context, args);
      }, delay);
    };

    return descriptor;
  };
}
