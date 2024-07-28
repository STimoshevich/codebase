import { NgZone } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

export function runOutsideAngular(ngZone: NgZone) {
  return function _runOutsideAngular<T>(source: Observable<T>) {
    const subj = new Subject<T>();
    let subscription: Subscription;

    ngZone.runOutsideAngular(() => {
      subscription = source.subscribe(subj);
    });

    return subj.pipe(
      finalize(() => {
        subscription.unsubscribe();
      })
    );
  };
}
