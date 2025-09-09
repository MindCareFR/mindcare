// src/app/interfaces/profesionnel.model.ts
export interface FiltersPayload {
  symptoms: string[];
  approach: string[];
  sex: string[];
  recommended: string[];
}

export interface FilterDef<K extends keyof FiltersPayload = keyof FiltersPayload> {
  key: K;
  label: string;
  options: string[];
}
