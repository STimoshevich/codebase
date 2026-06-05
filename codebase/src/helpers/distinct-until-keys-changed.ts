import {distinctUntilChanged, MonoTypeOperatorFunction} from "rxjs";

export function distinctUntilKeysChanged<T>(...keys: (keyof T)[]): MonoTypeOperatorFunction<T> {
  return distinctUntilChanged((old, current) => {
    return keys.every(key => current[key] === old[key]);
  });
}
