import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export function requiredIfValidator(predicate: () => boolean) {
  return (formControl: AbstractControl): ValidationErrors | null => {
    if (!formControl) {
      return null;
    }

    if (predicate()) {
      return Validators.required(formControl);
    }
    return null;
  };
}
