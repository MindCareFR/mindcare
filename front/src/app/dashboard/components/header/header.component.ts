import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  @Input() appName = 'MindCare';
  @Input() userName = '';
  @Output() toggleSidebarEvent = new EventEmitter<void>();

  @ViewChild('navToggle') navToggle!: ElementRef;
  @ViewChild('navBackground') navBackground!: ElementRef;

  checked = false;

  faSun: any;
  faMoon: any;

  constructor() {
    this.checked = document.documentElement.classList.contains('dark');
  }

  toggleSidebar(): void {
    this.toggleSidebarEvent.emit();
  }

  toggleNav(): void {
    if (this.navToggle && this.navToggle.nativeElement) {
      this.navToggle.nativeElement.checked = !this.navToggle.nativeElement.checked;
    }
  }

  toggleTheme(): void {
    this.checked = !this.checked;
    if (this.checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
