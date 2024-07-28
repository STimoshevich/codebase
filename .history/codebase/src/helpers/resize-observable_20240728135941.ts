import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

export function resizeObservable(
  element: Element
): Observable<ResizeObserverEntry[]> {
  let observer: ResizeObserver;
  return new Observable<ResizeObserverEntry[]>((subscribe) => {
    observer = new ResizeObserver((x) => {
      subscribe.next(x);
    });
    observer.observe(element);
  }).pipe(
    finalize(() => {
      observer.disconnect();
    })
  );
}
