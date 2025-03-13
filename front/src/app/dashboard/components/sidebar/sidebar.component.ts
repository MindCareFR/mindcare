import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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
      route: '/dashboard/support',
      active: false,
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Mettre à jour l'élément actif en fonction de l'URL actuelle
    this.updateActiveItems(this.router.url);

    // S'abonner aux changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveItems(event.url);
      });
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
