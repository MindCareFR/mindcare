import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { ProfileService } from '@services/profile.service';
import { AuthService } from '@services/auth.service';
import { Subject } from 'rxjs';
import {UserStateService} from '@services/user-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = true;
  @Input() notifications = 0;
  @Input() userName = '';
  @Input() userAvatar: string | null = null;
  @Output() toggleSidebar = new EventEmitter<void>(); // New output for mobile toggle

  // User data
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  role: string = '';
  isDarkMode: boolean = false;

  // For subscription management
  private destroy$ = new Subject<void>();

  // Injected services
  constructor(
    private router: Router,
    private profileService: ProfileService,
    private authService: AuthService,
    private userStateService: UserStateService // Inject the new service
  ) {}

  navItems = [
    {
      label: 'Tableau de bord',
      icon: 'home',
      route: '/dashboard',
      active: false,
      badge: false,
    },
    {
      label: 'Mes séances',
      icon: 'video',
      route: '/dashboard/sessions',
      active: false,
      badge: false,
    },
    {
      label: 'Mes rendez-vous',
      icon: 'calendar',
      route: '/dashboard/appointments',
      active: false,
      badge: false,
    },
    {
      label: 'Ressources',
      icon: 'book-open',
      route: '/dashboard/resources',
      active: false,
      badge: false,
    },
    {
      label: 'Messages',
      icon: 'message-circle',
      route: '/dashboard/messages',
      active: false,
      badge: true,
    },
    {
      label: 'Mon profil',
      icon: 'user',
      route: '/dashboard/profile',
      active: false,
      badge: false,
    },
  ];

  // Secondary links with route to settings
  secondaryNavItems = [
    {
      label: 'Paramètres',
      icon: 'settings',
      route: '/dashboard/settings',
      active: false,
    },
    {
      label: 'Support',
      icon: 'help-circle',
      route: '/contact',
      active: false,
    },
  ];

  ngOnInit() {
    // Update the active item based on the current URL
    this.updateActiveItems(this.router.url);

    // Subscribe to route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.updateActiveItems(event.url);
      });

    // Subscribe to user profile changes
    this.userStateService.currentUserProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        if (profile) {
          this.updateUserData(profile);
        } else {
          this.loadProfileData();
        }
      });

    // If input data is provided, use it
    if (this.userName) {
      const nameParts = this.userName.split(' ');
      this.firstName = nameParts[0] || '';
      this.lastName = nameParts.slice(1).join(' ') || '';
    } else {
      // Otherwise load from the service
      this.loadProfileData();
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Method to load user profile data
  loadProfileData() {
    // Use ProfileService which calls profile/me
    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profileData) => {
          console.log('Profile successfully loaded in sidebar:', profileData);
          this.updateUserData(profileData);
          // Update the shared state
          this.userStateService.updateUserProfile(profileData);
        },
        error: (error) => {
          console.error('Error while loading profile in sidebar:', error);
        }
      });
  }

  // Update user data
  private updateUserData(userData: any) {
    if (!userData) {
      console.warn('Empty profile data received in sidebar');
      return;
    }

    // Assign values while securing against null or undefined values
    this.firstName = userData.firstname || '';
    this.lastName = userData.lastname || '';
    this.email = userData.email || '';

    // Retrieve role (may be in different structures depending on the API)
    if (userData.role && typeof userData.role === 'object' && userData.role.name) {
      this.role = userData.role.name;
    } else if (typeof userData.role === 'string') {
      this.role = userData.role;
    } else {
      this.role = '';
    }

    // Make sure the avatar is properly defined
    if (userData.avatar && typeof userData.avatar === 'string' && userData.avatar.trim() !== '') {
      this.userAvatar = userData.avatar;
    }
  }

  // Method to get initials from names
  getInitials(): string {
    // If userName is defined, use it for initials
    if (this.userName) {
      const parts = this.userName.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (parts.length === 1 && parts[0]) {
        return parts[0][0].toUpperCase();
      }
    }

    // If first and last name are empty, try to take initials from email
    if ((!this.firstName || this.firstName.trim() === '') &&
      (!this.lastName || this.lastName.trim() === '') &&
      this.email) {
      const emailParts = this.email.split('@');
      if (emailParts.length > 0) {
        const namePart = emailParts[0];
        // Take the first two letters of the email or the first if there's only one letter
        return namePart.substring(0, Math.min(2, namePart.length)).toUpperCase();
      }
      return 'U'; // Fallback
    }

    // Standard initials
    const firstInitial = this.firstName && this.firstName.trim() !== ''
      ? this.firstName.charAt(0).toUpperCase()
      : '';

    const lastInitial = this.lastName && this.lastName.trim() !== ''
      ? this.lastName.charAt(0).toUpperCase()
      : '';

    // Return initials or 'U' if no initials available
    return (firstInitial + lastInitial) || 'U';
  }

  // Method to get the user's full name
  getFullName(): string {
    // If userName is provided, use it directly
    if (this.userName) {
      return this.userName;
    }

    // Check if name and first name are defined
    if ((this.firstName && this.firstName.trim() !== '') ||
      (this.lastName && this.lastName.trim() !== '')) {
      return `${this.firstName || ''} ${this.lastName || ''}`.trim();
    }

    // If no name/first name, use email without domain
    if (this.email) {
      const emailParts = this.email.split('@');
      if (emailParts.length > 0) {
        // Format email identifier by capitalizing the first letter
        let namePart = emailParts[0];
        namePart = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        return namePart;
      }
    }

    // Fallback
    return 'Utilisateur';
  }

  // Method to get role label
  getRoleLabel(): string {
    switch (this.role) {
      case 'ROLE_PATIENT':
        return 'Patient';
      case 'ROLE_PRO':
        return 'Professionnel';
      default:
        return 'Utilisateur';
    }
  }

  // Method to logout
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Method to update active items in navigation
  updateActiveItems(url: string) {
    // Update main navigation elements
    this.navItems.forEach(item => {
      item.active = url === item.route || url.startsWith(item.route + '/');
    });

    // Update secondary elements
    this.secondaryNavItems.forEach(item => {
      item.active = url === item.route || url.startsWith(item.route + '/');
    });
  }
}
