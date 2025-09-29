import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface AuthResponse {
  message?: string;
  token?: string;
  user_id?: string;
  user?: any;
  errors?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // URL de l'API
  private apiUrl = 'http://localhost:8000/api/auth';

  // Stockage de l'utilisateur connecté (BehaviorSubject)
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Clé utilisée pour stocker le token dans localStorage
  private tokenKey = 'token';

  constructor(private http: HttpClient) {
    console.log('AuthService initialized, API URL:', this.apiUrl);

    // Vérifier s'il y a un token au démarrage
    const token = this.getToken();
    if (token) {
      console.log('Token found in localStorage, fetching user profile');
      // Récupérer les données utilisateur si le token existe
      this.loadUserProfile().subscribe({
        next: user => console.log('User profile loaded:', user ? 'success' : 'no data'),
        error: error => console.error('Failed to load user profile:', error),
      });
    } else {
      console.log('No token found in localStorage');
    }
  }

  /**
   * Méthode privée pour charger le profil utilisateur
   */
  private loadUserProfile(): Observable<any> {
    return this.getUserProfile().pipe(
      tap(user => {
        if (user) {
          this.currentUserSubject.next(user);
        }
      }),
      catchError(error => {
        console.error('Error in loadUserProfile:', error);
        return of(null);
      })
    );
  }

  /**
   * Méthode de connexion: envoie email & mot de passe,
   * stocke le token et l'objet utilisateur si la connexion est réussie.
   */
  login(email: string, password: string): Observable<AuthResponse | null> {
    console.log('Login attempt with email:', email);

    // Définir les en-têtes
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    console.log('Sending request to:', `${this.apiUrl}/login`);
    console.log('Request payload:', { email, password: '********' });

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password }, { headers })
      .pipe(
        tap(response => {
          console.log('Raw login response:', response);
          if (response && response.token) {
            console.log('Token received, storing in localStorage');
            localStorage.setItem(this.tokenKey, response.token);
          } else {
            console.warn('No token in response. Response:', response);
          }

          if (response && response.user) {
            console.log('User data received, updating current user');
            this.currentUserSubject.next(response.user);
          } else {
            console.warn('No user data in response');
          }
        }),
        map(response => {
          if (response && response.token) {
            return response;
          }
          console.warn('Invalid response format, returning null');
          return null;
        }),
        catchError(error => {
          console.error('Login error:', error);
          if (error.status) {
            console.error('HTTP Status:', error.status);
          }
          if (error.error) {
            console.error('Error details:', error.error);

            // Afficher message d'erreur convivial
            if (error.error.message === 'Invalid credentials') {
              console.log('Identifiants invalides - email ou mot de passe incorrect');
            } else if (error.error.error === 'email_not_verified') {
              console.log('Email non vérifié - veuillez vérifier votre boîte mail');
            }
          }
          return of(null);
        })
      );
  }

  /**
   * Récupère les informations du profil utilisateur en utilisant le token stocké
   */
  getUserProfile(): Observable<any> {
    const token = this.getToken();
    console.log('Getting user profile with token:', token ? 'Present' : 'Not found');

    // Retourner null immédiatement si pas de token pour éviter une requête inutile
    if (!token) {
      return of(null);
    }

    // Définir les en-têtes avec autorisation
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${this.apiUrl}/user-profile`, { headers }).pipe(
      tap(user => {
        console.log('User profile data received:', user ? 'success' : 'empty');
        if (user) {
          this.currentUserSubject.next(user);
        }
      }),
      catchError(error => {
        console.error('Error fetching user profile:', error);
        // Commenté pour éviter la boucle infinie pendant le débogage
        // if (error.status === 401) {
        //   console.log('Authentication error, logging out');
        //   this.logout();
        // }
        return of(null);
      })
    );
  }

  /**
   * Obtient la valeur de l'utilisateur actuel de manière synchrone.
   */
  getCurrentUser(): any {
    const user = this.currentUserSubject.value;
    console.log('Getting current user:', user ? 'User exists' : 'No user');
    return user;
  }

  /**
   * Récupère le token depuis localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Vérifie si un token est présent dans localStorage.
   */
  isAuthenticated(): boolean {
    const isAuth = !!this.getToken();
    console.log('Authentication check:', isAuth ? 'Authenticated' : 'Not authenticated');
    return isAuth;
  }

  /**
   * Déconnexion: supprime le token et définit l'utilisateur à null.
   */
  logout(): void {
    console.log('Logging out user');
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  /**
   * Enregistre un patient
   */
  registerPatient(formData: any): Observable<AuthResponse | null> {
    console.log('Registering patient with data:', formData);

    return this.http.post<AuthResponse>(`${this.apiUrl}/register/patient`, formData).pipe(
      tap(response => console.log('Patient registration response:', response)),
      catchError(error => {
        console.error('Patient registration error:', error);
        return of(null);
      })
    );
  }

  /**
   * Enregistre un professionnel
   */
  registerProfessional(formData: any): Observable<AuthResponse | null> {
    // Traitement des données avant envoi
    let languages = [];
    if (typeof formData.languages === 'string') {
      languages = formData.languages.split(',').map((lang: string) => lang.trim());
    } else if (Array.isArray(formData.languages)) {
      languages = formData.languages;
    } else if (formData.languages) {
      languages = [formData.languages];
    }

    // Formatage de la date
    let birthdate = formData.birthdate;
    if (birthdate && typeof birthdate === 'string') {
      if (birthdate.includes('/')) {
        const [day, month, year] = birthdate.split('/');
        birthdate = `${year}-${month}-${day}`;
      } else if (!birthdate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        try {
          const date = new Date(birthdate);
          birthdate = date.toISOString().split('T')[0];
        } catch (e) {
          console.error("Erreur d'analyse de date:", e);
        }
      }
    }

    // Création du payload avec les valeurs spécifiques de test pour les ID
    const payload = {
      ...formData,
      birthdate: birthdate,
      languages: languages,
      experience: parseInt(formData.experience) || 0,
      medical_identification_number: '1234567890', // Utiliser exactement cette valeur
      company_identification_number: '98765432100012', // Utiliser exactement cette valeur
    };

    console.log('Payload professionnel complet:', JSON.stringify(payload, null, 2));

    return this.http.post<AuthResponse>(`${this.apiUrl}/register/pro`, payload).pipe(
      tap(response => console.log('Professional registration response:', response)),
      catchError(error => {
        console.error('Professional registration error:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.error?.message || error.message);
        console.error('Detailed errors:', error.error?.errors || error.error);
        return of(null);
      })
    );
  }
}
