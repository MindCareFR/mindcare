import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    imports: [],
    templateUrl: './footer.component.html'
})
export class FooterComponent {
  appName = 'MindCare';
  currentYear: number = new Date().getFullYear();
}
