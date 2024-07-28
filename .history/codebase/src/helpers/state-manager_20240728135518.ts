import { BehaviorSubject, combineLatest, map, Observable, skip } from 'rxjs';
import { startWith } from 'rxjs/operators';

class State {
  private _stateSubject = new BehaviorSubject(false);
  public state$ = this._stateSubject.pipe(skip(1));
  public get state(): boolean {
    return this._stateSubject.value;
  }

  public toggle(state?: boolean) {
    if (state === undefined) {
      this._stateSubject.next(!this.state);
    } else {
      this._stateSubject.next(state);
    }
  }
}

type TStateManagerAdditional = {
  isAny$: Observable<boolean>;
};

export function createStateManager<T extends string>(
  ...withStates: T[]
): Record<T, State> & TStateManagerAdditional {
  const obj = withStates.reduce(
    (acc, _var) => ({
      ...acc,
      [_var]: new State(),
    }),
    {} as Record<T, State>
  );

  const states: Observable<boolean>[] = [];
  for (const objKey in obj) {
    states.push(obj[objKey].state$.pipe(startWith(false)));
  }

  const isAny$ = combineLatest(states).pipe(
    map((states) => states.some((s) => !!s))
  );

  return { ...obj, isAny$ };
}
