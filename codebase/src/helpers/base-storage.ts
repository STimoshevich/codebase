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
  private _dataSubject = new BehaviorSubject<T | null>(null);

  public readonly items$: Observable<T | null>;
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
        return this._dataSubject;
      }),
      tap(() => this._loadingSubject.next(false))
    );
  }

  protected abstract get(): Observable<T>;

  public reload(): void {
    this._dataSubject.next(null);
  }
}

const EMPTY_STORAGE_VALUE = 'EMPTY_STORAGE_VALUE';

class BaseStorage2<T> extends Observable<T> {
  private readonly loadingSubject = new ReplaySubject<boolean>(1);
  private readonly internalData$ = new BehaviorSubject<T | null | typeof EMPTY_STORAGE_VALUE>(EMPTY_STORAGE_VALUE);

  readonly loading$ = this.loadingSubject.asObservable();

  constructor(private readonly from: Observable<T>) {
    super(subscriber => {
      const subscription = this.getData().subscribe({
        next: x => {
          subscriber.next(x);
        },
        error: (err: unknown) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  reloadIf(condition?: (currentValue: T) => boolean) {
    const current = this.internalData$.value === EMPTY_STORAGE_VALUE ? undefined : this.internalData$.value;

    if (!condition) {
      this.reload();
    } else if (condition(current)) {
      this.reload();
    }

    return this;
  }

  reload(): void {
    this.internalData$.next(EMPTY_STORAGE_VALUE);
  }

  @tuiPure
  private getData(): Observable<T> {
    const initial$ = defer(() => this.from).pipe(
      tap(x => this.internalData$.next(x)),
      share(),
    );

    return this.internalData$.pipe(
      tap(() => this.loadingSubject.next(true)),
      switchMap(data => {
        if (data === EMPTY_STORAGE_VALUE) {
          return initial$;
        }

        return this.internalData$;
      }),
      finalize(() => this.loadingSubject.next(false)),
      tap(() => this.loadingSubject.next(false)),
      filter((x): x is T => x !== EMPTY_STORAGE_VALUE),
    );
  }
}

export abstract class BaseStorageFactory2<T> {
  private items: {[key: string]: BaseStorage2<T>} = {};

  protected abstract get(...args: unknown[]): Observable<T>;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  data$(...args: Parameters<(typeof this)['get']>): BaseStorage2<T> {
    const key = this.getKey(...args);

    if (!this.items[key]) {
      this.items[key] = new BaseStorage2<T>(this.get(...args));
    }

    return this.items[key];
  }

  private getKey(...from: unknown[]): string {
    return JSON.stringify(from);
  }
}

