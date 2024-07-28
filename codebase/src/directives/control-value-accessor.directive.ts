import {
  AfterViewInit,
  DestroyRef,
  Directive,
  DoCheck,
  HostListener,
  Input,
  Optional,
  Output,
  Self,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NgControl,
  ValidationErrors,
  Validator,
} from '@angular/forms';

@Directive({
  selector: '[sxCustomControl]',
  standalone: true,
})
export class ControlValueAccessorDirective<TValue>
  implements ControlValueAccessor, Validator, DoCheck, AfterViewInit
{
  @HostListener('focusout')
  private _focusout(): void {
    this._onTouched();
    this._validate();
  }

  private _onTouched: () => void = () => void 0;
  public _onChange: (_: TValue | null) => void = () => void 0;
  public readonly instance = new FormControl<TValue | null>(null);
  @Input() set value(value: TValue) {
    this.instance.setValue(value, { emitEvent: false });
  }

  @Output() valueChange = this.instance.valueChanges;

  constructor(
    private _destroyRef: DestroyRef,
    @Optional() @Self() public controlDir?: NgControl
  ) {
    if (controlDir) {
      controlDir.valueAccessor = this;
    }
    this.valueChange
      .pipe(takeUntilDestroyed())
      .subscribe((x) => this._onChange(x));
  }

  public ngAfterViewInit(): void {
    if (this.controlDir?.control) {
      this.controlDir.control.statusChanges
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this._validate();
        });
    }
  }

  public writeValue(value: TValue): void {
    this.value = value;
  }

  public registerOnChange(onChange: (_: TValue | null) => void): void {
    this._onChange = onChange;
  }

  public registerOnTouched = (fn: () => void) => {
    this._onTouched = fn;
  };

  public setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.instance.disable({ emitEvent: false });
    } else {
      this.instance.enable({ emitEvent: false });
    }
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    setTimeout(() => {
      control.invalid
        ? this.instance.setErrors({ invalid: true })
        : this.instance.setErrors(null);
    });
    return null;
  }

  public ngDoCheck() {
    if (this.instance.touched) {
      return;
    }
    if (this.controlDir?.control?.touched) {
      this.instance.markAsTouched();
      this._validate();
    }
  }

  private _validate(): void {
    if (!this.controlDir?.control) {
      return;
    }
    this.validate(this.controlDir?.control);
  }
}
