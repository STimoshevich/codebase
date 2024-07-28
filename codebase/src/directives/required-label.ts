import { Directive, HostBinding, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl } from '@angular/forms';
import { asRequired } from 'creditor-core';
import { BehaviorSubject, filter, map, switchMap } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Directive({
  selector: '[creditorRequiredLabel]',
})
export class RequiredLabelDirective {
  @HostBinding('class.required-asterisk')
  private _isRequired = false;
  private _ctrlSubject = new BehaviorSubject<AbstractControl | null>(null);

  @Input() set isRequired(value: boolean | null | AbstractControl) {
    if (value instanceof AbstractControl) {
      this._ctrlSubject.next(value);
    } else {
      this._isRequired = value ?? false;
    }
  }

  constructor() {
    this._ctrlSubject
      .pipe(
        filter((x) => !!x),
        switchMap((x) => asRequired(x).statusChanges.pipe(startWith(null))),
        takeUntilDestroyed(),
        map(() => this._isControlRequired(asRequired(this._ctrlSubject.value)))
      )
      .subscribe((x) => (this._isRequired = x));
  }

  private _isControlRequired = (control: AbstractControl) => {
    const { validator } = control;
    if (validator) {
      const validation = validator(new FormControl());
      return validation !== null && validation.required === true;
    }
    return false;
  };
}
