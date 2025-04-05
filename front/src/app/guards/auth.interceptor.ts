import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Récupération du token directement depuis localStorage
  const token = localStorage.getItem('token');

  if (token) {
    console.log('Intercepting request with token:', req.url);
    // Cloner la requête et ajouter le token aux en-têtes
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  }

  console.log('Intercepting request without token:', req.url);
  return next(req);
};
