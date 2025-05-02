import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { AuthService } from '@services/auth.service';
import { UserStateService } from '@services/user-state.service';
import {FooterComponent} from '@components/footer/footer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  appName = 'MindCare';
  isSidebarOpen = true;
  isDarkMode = false;

  userProfile = {
    name: '',
    email: '',
    avatar: '',
    notifications: 3,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userStateService: UserStateService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadUserProfile();
    this.initDarkMode();
    this.subscribeToProfileChanges();

    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  // Subscribe to profile changes from UserStateService
  subscribeToProfileChanges(): void {
    this.userStateService.currentUserProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        if (profile) {
          const firstName = profile.firstname || '';
          const lastName = profile.lastname || '';
          this.userProfile.name = `${firstName} ${lastName}`.trim();
          this.userProfile.email = profile.email || '';
          if (profile.avatar) {
            this.userProfile.avatar = profile.avatar;
          }
        }
      });
  }

  initDarkMode(): void {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      this.isDarkMode = savedMode === 'true';
    } else {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.updateDarkModeClass();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.updateDarkModeClass();
  }

  private updateDarkModeClass(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  loadUserProfile(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const profile = {
          firstname: user.firstname || '',
          lastname: user.lastname || '',
          email: user.email || '',
          avatar: user.avatar || null,
          role: user.role || ''
        };

        // Update the shared state service
        this.userStateService.updateUserProfile(profile);

        // Also update local component state
        this.userProfile.name = `${profile.firstname} ${profile.lastname}`.trim();
        this.userProfile.email = profile.email;
        if (profile.avatar) {
          this.userProfile.avatar = profile.avatar;
        }
      } else {
        this.authService.getUserProfile().subscribe(
          profile => {
            if (profile) {
              // Update the shared state service
              this.userStateService.updateUserProfile(profile);

              // Also update local component state
              this.userProfile.name = `${profile.firstname || ''} ${profile.lastname || ''}`.trim();
              this.userProfile.email = profile.email || '';
              if (profile.avatar) {
                this.userProfile.avatar = profile.avatar;
              }
            }
          },
          error => {
            console.error('Error retrieving profile', error);
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
