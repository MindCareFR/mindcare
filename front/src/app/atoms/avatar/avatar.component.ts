import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AvatarVariant } from './avatarType';

@Component({
  selector: 'app-avatar',
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
})
export class AvatarComponent {
  @Input() size: string = '10';
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() variant: string = '';

  AVATAR_VARIANT: AvatarVariant[] = [
    {
      name: 'round',
      border: 'border-2',
      padding: 'p-0.5',
      rounded: 'rounded-full',
      shadow: 'shadow-md',
      borderColor: 'border-gray-200',
    },
    {
      name: 'square',
      border: 'border-2',
      padding: 'p-0.5',
      rounded: 'rounded-lg',
      shadow: 'shadow-md',
      borderColor: 'border-gray-200',
    },
  ];

  selectVariant(): string[] {
    const variant: AvatarVariant | undefined = this.AVATAR_VARIANT.find(
      (v: AvatarVariant): boolean => v.name === this.variant
    );
    if (!variant) return [];

    return [
      variant.border,
      variant.padding,
      variant.rounded,
      variant.shadow,
      variant.borderColor,
      this.variant === 'round' ? 'hover:shadow-lg' : 'hover:shadow-md',
      'transition-all duration-300',
    ];
  }
}
