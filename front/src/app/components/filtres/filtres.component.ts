import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { FiltersPayload, FilterDef } from '@interfaces/profesionnel.interface';

@Component({
  selector: 'app-filtres',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filtres.component.html',
  styleUrls: ['./filtres.component.css'],
})
export class FiltresComponent {
  @Output() filtersChange = new EventEmitter<FiltersPayload>();

  filters: FilterDef[] = [
    { key: 'symptoms',    label: 'Symptômes',   options: ['Anxiety', 'Depression', 'Stress', 'Insomnie'] },
    { key: 'approach',    label: 'Approche',    options: ['Cognitive Therapy', 'Gestalt', 'Méditation', 'Hypnose'] },
    { key: 'sex',         label: 'Sexe',        options: ['Femme', 'Homme', 'Autre'] },
    { key: 'recommended', label: 'Recommandé',  options: ['Top', 'Tendance', 'Pro'] },
    { key: 'diplome',     label: 'Diplôme',     options: ['PhD', 'MSc', 'MD', 'PsyD'] },
  ];

  dropdowns: Partial<Record<keyof FiltersPayload, boolean>> = {};

  selected: FiltersPayload = {
    symptoms: [],
    approach: [],
    sex: [],
    recommended: [],
    diplome: [],
  };

  toggleDropdown(key: keyof FiltersPayload, e?: Event): void {
    if (e) e.stopPropagation();
    this.dropdowns[key] = !this.dropdowns[key];
  }

  closeDropdown(key: keyof FiltersPayload): void {
    this.dropdowns[key] = false;
  }

  closeAll(): void {
    (Object.keys(this.dropdowns) as Array<keyof FiltersPayload>)
      .forEach(k => (this.dropdowns[k] = false));
  }

  @HostListener('document:click') onDocClick(): void { this.closeAll(); }
  @HostListener('document:keydown.escape') onEsc(): void { this.closeAll(); }

  isSelected(key: keyof FiltersPayload, option: string): boolean {
    return this.selected[key].includes(option);
  }

  toggleOption(key: keyof FiltersPayload, option: string): void {
    const arr = this.selected[key];
    this.selected[key] = arr.includes(option)
      ? arr.filter((o: string) => o !== option)
      : [...arr, option];
    this.emitSelected();
  }

  clearFilter(key: keyof FiltersPayload, e?: Event): void {
    if (e) e.stopPropagation();
    this.selected[key] = [];
    this.emitSelected();
  }

  remove(key: keyof FiltersPayload, option: string): void {
    this.selected[key] = this.selected[key].filter((o: string) => o !== option);
    this.emitSelected();
  }

  clearAll(): void {
    this.selected = { symptoms: [], approach: [], sex: [], recommended: [], diplome: [] };
    this.emitSelected();
  }

  chips(): Array<{ key: keyof FiltersPayload; label: string; value: string }> {
    const out: Array<{ key: keyof FiltersPayload; label: string; value: string }> = [];
    for (const f of this.filters) {
      this.selected[f.key].forEach((v: string) =>
        out.push({ key: f.key, label: f.label, value: v })
      );
    }
    return out;
  }

  hasAnySelection(): boolean {
    return (
      this.selected.symptoms.length +
      this.selected.approach.length +
      this.selected.sex.length +
      this.selected.recommended.length
    ) > 0;
  }

  trackByOption(index: number, opt: string): string { return opt; }
  trackByChip(index: number, chip: { key: keyof FiltersPayload; value: string }): string {
    return `${String(chip.key)}:${chip.value}`;
  }

  private emitSelected(): void {
    this.filtersChange.emit({ ...this.selected });
  }
}
