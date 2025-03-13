import { AbstractControl, ValidationErrors } from '@angular/forms';

export interface IFormField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  validators?: ValidatorFn[];
  defaultValue?: string | number | boolean;
  width?: string;
  rows?: number;
}

// Updated ValidatorFn to be compatible with Angular's ValidatorFn
export interface ValidatorFn {
  (control: AbstractControl): ValidationErrors | null;
}

export interface IFormGroup {
  group: string;
  label?: string;
  description?: string;
  fields: IFormField[];
  styles?: string;
}

export interface IFormConfig {
  fields: IFormGroup[];
  submitLabel: string;
  cancelLabel?: string;
  styles?: string;
  isIndexed: boolean;
}
