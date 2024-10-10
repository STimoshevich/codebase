import {inject} from "@angular/core";
import {Observable} from "rxjs";

type TypesOfType<T> = T[keyof T];

type ExtractDialogData<T> = T extends TuiDialogContext<any, infer U> ? U : never;

type ExtractDialogResult<T> = T extends TuiDialogContext<infer U, any> ? U : never;

function dialog<T>(
  component: new (...args: any[]) => T,
): (
  data: ExtractDialogData<TypesOfType<T>>,
  options?: Partial<TuiDialogOptions<any>> | undefined,
) => Observable<ExtractDialogResult<TypesOfType<T>>> {
  const dialogService = inject(TuiDialogService);

  return data => dialogService.open(new PolymorpheusComponent(component), {data});
}
