import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-filtres',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './filtres.component.html',
  styleUrl: './filtres.component.css'
})
export class FiltresComponent {

  filters = [
    { key: 'symptoms', label: 'Symptômes', options: ["Test"] },
    { key: 'approach', label: 'Approche', options: ["Test"] },
    { key: 'sex', label: 'Sex', options: ["Test"] },
    { key: 'recommended', label: 'Recommandé', options: ["Test"] },
  ];

  dropdowns: { [key: string]: boolean } = {};

  toggleDropdown(key: string) {
    this.dropdowns[key] = !this.dropdowns[key];
  }

  selectOption(key: string, option: string) {
    console.log(`Selected ${option} for ${key}`);
    this.dropdowns[key] = false;
  }
}
