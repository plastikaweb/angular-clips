import { inject, Injectable } from '@angular/core';
import { Auth, fetchSignInMethodsForEmail } from '@angular/fire/auth';
import { AbstractControl, AsyncValidator, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchFields(fieldOne: string, fieldTwo: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const fieldOneControl = group.get(fieldOne);
    const fieldTwoControl = group.get(fieldTwo);

    const error = fieldOneControl?.value !== fieldTwoControl?.value ? { noMatch: true } : null;

    fieldTwoControl?.setErrors(error);

    return error;
  };
}

@Injectable({ providedIn: 'root' })
export class isEmailTaken implements AsyncValidator {
  auth = inject(Auth);

  validate = (control: AbstractControl): Promise<ValidationErrors | null> => {
    console.log(control.value);

    const signInMethods = fetchSignInMethodsForEmail(this.auth, control.value);
    console.log(signInMethods);
    return signInMethods.then((methods) => methods.length > 0 ? { emailTaken: true } : null);

  }
}
