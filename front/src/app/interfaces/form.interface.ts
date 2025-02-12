export interface IFormField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  validators?: ValidatorFn[];
  defaultValue?: string | number | boolean;
}

export type ValidatorFn = (value: string | number | boolean) => boolean;

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