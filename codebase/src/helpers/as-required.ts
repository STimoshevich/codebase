export function asRequired<T>(value: T, message?: string): NonNullable<T> {
  if(value === null || value === undefined) {
    throw new Error(message ?? 'значение должно быть заполнено')
  }
  return value
}
