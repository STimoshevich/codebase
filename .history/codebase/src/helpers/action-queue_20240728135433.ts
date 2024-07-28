import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  concatMap,
  map,
  Observable,
  of,
  ReplaySubject,
  Subject,
  tap,
} from 'rxjs';

type TObservableQueue<T> = {
  observable: Observable<T>;
  condition?: () => boolean;
};

type TAction<T> = Observable<T> | (() => T);

export class ActionsQueue {
  private readonly _loadingSubject = new ReplaySubject<boolean>(1);
  private readonly _queueSubject = new Subject<TObservableQueue<unknown>>();
  private readonly _queue: Signal<void>;
  public readonly loading$ = this._loadingSubject.asObservable();

  constructor() {
    this._queue = toSignal(
      this._queueSubject.asObservable().pipe(
        concatMap((x) => {
          this._loadingSubject.next(true);
          if (!x.condition) {
            return x.observable;
          }
          return x.condition() ? x.observable : of(null);
        }),
        tap(() => this._loadingSubject.next(false)),
        map(() => void 0)
      )
    );
  }

  public add<T>(action: TAction<T>, condition?: () => boolean): this {
    let observable: Observable<T>;
    if (action instanceof Observable) {
      observable = action;
    } else {
      observable = of(null).pipe(map(() => action()));
    }
    this._queueSubject.next({ observable, condition });
    return this;
  }
}
