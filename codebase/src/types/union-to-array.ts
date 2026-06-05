export type UnionToArray<T, U = T> = [T] extends [never]
  ? []
  : T extends T
    ? [T, ...UnionToArray<Exclude<U, T>>]
    : never;
