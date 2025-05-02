import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { ThemeService } from '@services/theme.service';
import { FooterComponent } from '@components/footer/footer.component';

@Component({
  selector: 'app-page404',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './page404.component.html',
  styleUrls: ['./page404.component.scss'],
})
export class NotFoundComponent implements OnInit {
  appName = 'MindCare';
  isDarkMode = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // S'abonner aux changements de thème
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }
}
