import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { AvatarComponent } from './atoms/avatar/avatar.component';
import { ButtonImgComponent } from './atoms/test-atom/button-img';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, ButtonImgComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  count: number= 0
  constructor(private cdr: ChangeDetectorRef) {}

  buyItem(){
    this.count++;
    console.log("GG", this.count)
    this.cdr.detectChanges();
  }

  minusItem(){
    this.count--;
    console.log("GG", this.count)
    this.cdr.detectChanges();
  }
}
