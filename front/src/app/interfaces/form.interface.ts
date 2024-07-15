export interface IFormField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  validators?: any[];
  defaultValue?: any;
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