import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ButtonVariants, Variant, ColorVariants, Color} from './button-imgType';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-button-img',
  standalone: true,
  imports: [CommonModule,
    FormsModule
  ],
  templateUrl: './button-img.html',
})
export class ButtonImgComponent {

  count: number= 0

  @Input() label: string = "Click";
  @Output() clicked = new EventEmitter<void>();
  @Input() variant: Variant = 'blue';
  @Input() color: Color = 'white';
  @Input() disabled: boolean = false;
  @Input() alt: string = 'img';
  @Input() src: string = '';
  @Input() sizeImg: string = '15';


  BUTTON_VARIANT: ButtonVariants[] = [
    {
      name: 'purple',
      background: 'bg-purple-500',
      hover: 'hover:shadow-[inset_0px_6px_12px_rgba(0,0,0,0.4)]',
      border: '',
    },
    {
      name: 'blue',
      background: 'bg-blue-500',
      hover: 'hover:shadow-[inset_0px_6px_12px_rgba(0,0,0,0.4)]',
      border: '',
    },
    {
      name: 'transparent',
      background: 'bg-transparent',
      hover: 'hover:shadow-[inset_0px_6px_12px_rgba(0,0,0,0.2)]',
      border: 'border border-blue-500',
    },
    {
      name: 'disable',
      background: 'bg-gray-500',
      hover: 'hover:shadow-inner',
      border: '',
    },
  ];

  COLOR_VARIANT: ColorVariants[] = [
    // {
    //   name: 'blue',
    //   colors: 'text-white',
    // },
    // {
    //   name: 'purple',
    //   colors: 'text-white',
    // },
    // {
    //   name: 'transparent',
    //   colors: 'text-blue-500',
    // },
    // {
    //   name: 'disable',
    //   colors: 'text-white',
    // },
    {
      name: 'blue',
      colors: 'text-blue-500',
    },
    {
      name: 'white',
      colors: 'text-white',
    },
  ]



  // @Output() countChanged = new EventEmitter<number>();

  heandClick(){
    this.clicked.emit();
  }

  selectVariant(): string[] {
      const color: ButtonVariants | undefined = this.BUTTON_VARIANT.find(
        (c: ButtonVariants): boolean => c.name == this.variant
      );
      return color
        ? [color.background, color.border, color.hover]
        : [];
    }

    selectColor(): string[] {
      const color: ColorVariants | undefined = this.COLOR_VARIANT.find(
        (c: ColorVariants): boolean => c.name == this.color
        // (c: ColorVariants): boolean => c.name == this.variant
        // will be trained by the background color of the button and depending on it
        // assign the color to the text (background: blue, it is necessary to specify that blue=white text).

      );
      return color
        ? [color.colors]
        : [];
    }

    // countChang() {
    //   this.count++;
    //   console.log(this.count);
    // }
}
