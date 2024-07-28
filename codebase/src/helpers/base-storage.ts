import {
  BehaviorSubject,
  defer,
  map,
  Observable,
  ReplaySubject,
  share,
  switchMap,
  tap,
} from 'rxjs';

export abstract class BaseStorage<T> {
  private _loadingSubject = new ReplaySubject<boolean>(1);
  private _dataSubject = new BehaviorSubject<T[] | null>(null);

  public readonly items$: Observable<T[]>;
  public readonly loading$ = this._loadingSubject.asObservable();

  protected constructor() {
    const initial$ = defer(() => this.get()).pipe(
      tap((x) => this._dataSubject.next(x)),
      share()
    );

    this.items$ = this._dataSubject.pipe(
      tap(() => this._loadingSubject.next(true)),
      switchMap(() => {
        if (!this._dataSubject.value) {
          return initial$;
        }
        return this._dataSubject.pipe(map((x) => x ?? []));
      }),
      tap(() => this._loadingSubject.next(false))
    );
  }

  protected abstract get(): Observable<T[]>;

  public reload(): void {
    this._dataSubject.next(null);
  }
}
