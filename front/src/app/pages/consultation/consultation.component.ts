import { Component } from '@angular/core';
import { FooterComponent } from '@components/footer/footer.component';
import { NavbarComponent } from '@components/navbar/navbar.component';


@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [FooterComponent,
    NavbarComponent
  ],
  templateUrl: './consultation.component.html',
  styleUrl: './consultation.component.css'
})
export class ConsultationComponent {

}
