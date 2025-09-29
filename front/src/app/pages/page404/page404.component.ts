import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '@components/footer/footer.component';
import { NavbarComponent } from '@components/navbar/navbar.component'; // Vérifiez le chemin correct

@Component({
  selector: 'app-page404',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './page404.component.html',
  styleUrls: ['./page404.component.scss'],
})
export class NotFoundComponent {
  appName = 'MindCare';
}
