import { Routes } from '@angular/router';
/*
 *Les routes sont assembler de sortes a être paquet et facielement retrouvable.
 *Children c'est toute les sous routes qui partent a partir d'un uri
 *canActivate -> pour les routes proteger par des guards (ng g guard "nomduguards")
 */
export const routes: Routes = [
  //Routes non protéger et libre d'accés anonyme
  {
    path: '',
    children: [
      // {
      //   path: "login",
      //   component: loginComponent
      // }
    ],
  },

  //Route accédable uniquement par un praticien (practitioner)
  {
    path: 'practitioner',
    children: [
      // {
      //   path: "login",
      //   component: loginComponent
      // }
    ],
  },

  //Route accédable uniquement par un patient (patient)
  {
    path: 'patient',
    children: [
      // {
      //   path: "login",
      //   component: loginComponent
      // }
    ],
  },

  //Page de redirection en cas d'érreur à garder tout à la fin des routes pour éviter les soucis
  // {
  //   path: '**',
  //   component: 404compoennts
  // }
];
