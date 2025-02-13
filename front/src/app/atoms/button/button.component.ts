import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonColor, Variant } from './buttonType';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() variant: Variant = 'blue';
  @Input() disabled: boolean = false;

  BUTTON_COLORS: ButtonColor[] = [
    {
      name: 'blue',
      background: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      text: 'text-white',
      border: '',
    },
    {
      name: 'purple',
      background: 'bg-purple-500',
      hover: 'hover:bg-purple-600',
      text: 'text-white',
      border: '',
    },
  ];

  selectVariant(): string[] {
    const color: ButtonColor | undefined = this.BUTTON_COLORS.find(
      (c: ButtonColor): boolean => c.name == this.variant
    );
    return color
      ? [color.background, color.border, color.hover, color.text]
      : [];
  }
}
