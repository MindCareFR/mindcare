import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = true;
  @Input() userName = '';
  @Input() userAvatar = '';
  @Input() notifications = 0;
  @Input() role = '';

  // Ajout des propriétés pour le nom et prénom
  firstName: string = '';
  lastName: string = '';

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

  // Second group
  secondaryNavItems = [
    {
      label: 'Réglages',
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

  constructor(
    private router: Router,
    private authService: AuthService  // Injecter le service d'authentification
  ) {}

  ngOnInit() {
    // Mettre à jour l'élément actif en fonction de l'URL actuelle
    this.updateActiveItems(this.router.url);

    // S'abonner aux changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveItems(event.url);
      });

    // Récupérer les informations de l'utilisateur connecté
    this.loadUserInfo();
  }

  // Méthode pour obtenir les initiales (similaire à celle du composant profil)
  getInitials(): string {
    const firstname = this.firstName || '';
    const lastname = this.lastName || '';

    const firstInitial = firstname.charAt(0).toUpperCase();
    const lastInitial = lastname.charAt(0).toUpperCase();

    return firstInitial + lastInitial || 'U';
  }

  // Nouvelle méthode pour charger les informations de l'utilisateur
  loadUserInfo() {
    // Observer les changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.firstName = user.firstname || '';
        this.lastName = user.lastname || '';
        this.role = user.role?.name || '';

        // Si input userName est vide, on le remplace par prénom + nom
        if (!this.userName) {
          this.userName = `${this.firstName} ${this.lastName}`;
        }

        // On peut aussi récupérer l'avatar si disponible
        this.userAvatar = user.avatar || '';
      } else {
        // Si pas d'utilisateur, on peut appeler getProfile pour récupérer les infos
        this.authService.getUserProfile().subscribe(
          profile => {
            if (profile) {
              this.firstName = profile.firstname || '';
              this.lastName = profile.lastname || '';
              this.userName = `${this.firstName} ${this.lastName}`;
              this.userAvatar = profile.avatar || '';
            }
          },
          error => {
            console.error('Erreur lors de la récupération du profil', error);
          }
        );
      }
    });
  }

  // Méthode pour se déconnecter
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  updateActiveItems(url: string) {
    // Mettre à jour les éléments de navigation principale
    this.navItems.forEach(item => {
      item.active = url === item.route || url.startsWith(item.route + '/');
    });

    // Mettre à jour les éléments secondaires
    this.secondaryNavItems.forEach(item => {
      item.active = url === item.route || url.startsWith(item.route + '/');
    });
  }
}
