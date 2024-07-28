import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isIntersect',
})
export class IsIntersectPipe<T> implements PipeTransform {
  public transform(value: T[] | null, array: T[] | null): boolean {
    if (!array || !value) {
      return false;
    }
    return array.findIndex((x) => value.includes(x)) >= 0;
  }
}
