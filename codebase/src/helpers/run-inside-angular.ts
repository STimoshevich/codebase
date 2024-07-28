import { NgZone } from '@angular/core';
import { finalize, Observable, Subject } from 'rxjs';

export function runInsideAngular(ngZone: NgZone) {
  return function _runInsideAngular<T>(source: Observable<T>) {
    const subj = new Subject<T>();
    const subscription = source.subscribe((x) => {
      ngZone.run(() => {
        subj.next(x);
      });
    });

    return subj.pipe(
      finalize(() => {
        subscription.unsubscribe();
      })
    );
  };
}
