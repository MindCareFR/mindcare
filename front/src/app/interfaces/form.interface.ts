export interface IFormFields {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  validators?: any[];
  defaultValue?: any;
}

export interface IFormConfig {
  fields: IFormFields[];
  submitLabel: string;
}