export const isTypeCorrect = <T>(
  value: unknown,
  ...fields: (keyof T)[]
): value is T => {
  if (!fields.length) {
    return false;
  }
  return fields.every((field) => (value as T)[field] !== undefined);
};
