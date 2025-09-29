import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from '@components/footer/footer.component';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent, FooterComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  appName = 'MindCare';
  isSidebarOpen = true;

  userProfile = {
    name: '',
    email: '',
    avatar: '',
    notifications: 3,
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadUserProfile();

    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  loadUserProfile(): void {
    // Observer les changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const firstName = user.firstname || '';
        const lastName = user.lastname || '';
        this.userProfile.name = `${firstName} ${lastName}`;
        this.userProfile.email = user.email || '';
        if (user.avatar) {
          this.userProfile.avatar = user.avatar;
        }
      } else {
        // Si pas d'utilisateur, on peut appeler getProfile pour récupérer les infos
        this.authService.getUserProfile().subscribe(
          profile => {
            if (profile) {
              const firstName = profile.firstname || '';
              const lastName = profile.lastname || '';
              this.userProfile.name = `${firstName} ${lastName}`;
              this.userProfile.email = profile.email || '';
              if (profile.avatar) {
                this.userProfile.avatar = profile.avatar;
              }
            }
          },
          error => {
            console.error('Erreur lors de la récupération du profil', error);
          }
        );
      }
    });
  }

  checkScreenSize(): void {
    this.isSidebarOpen = window.innerWidth > 768;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
