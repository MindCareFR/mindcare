import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap, finalize } from 'rxjs/operators';
import { DecryptionService } from './decryption.service';
import { environment } from '../../environnement';

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface PasswordChangeResponse {
  message?: string;
}

export interface AnonymousModeResponse {
  is_anonymous: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = environment.apiUrl;
  private readonly authUrl = `${this.apiUrl}/auth`;
  private readonly profileUrl = `${this.apiUrl}/profile`;

  constructor(
    private readonly http: HttpClient,
    private readonly decryptionService: DecryptionService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getProfile(): Observable<any> {
    console.group('Récupération du profil');
    console.log('URL de la requête:', `${this.authUrl}/user-profile`);

    return this.http
      .get(`${this.authUrl}/user-profile`, {
        headers: this.getHeaders(),
        observe: 'response',
      })
      .pipe(
        map((response: any) => {
          console.log('Statut de la réponse:', response.status);
          console.log('En-têtes de la réponse:', response.headers);
          console.log('Données brutes:', response.body);

          if (!response.body) {
            console.error('Aucune donnée reçue');
            throw new Error('No user data');
          }

          try {
            // Déchiffrer les données sensibles
            const decryptedUserData = this.decryptionService.decryptObject(response.body);
            console.log('Données déchiffrées:', decryptedUserData);

            const userRole = decryptedUserData.role?.name || 'ROLE_PATIENT';

            const result: any = {
              ...decryptedUserData,
              phone: decryptedUserData.phone || '',
              address: decryptedUserData.address || '',
              address_complement: decryptedUserData.address_complement || '',
              zipcode: decryptedUserData.zipcode || '',
              city: decryptedUserData.city || '',
              country: decryptedUserData.country || '',
              role: { name: userRole },
              avatar: decryptedUserData.avatar || '/avatar.png',
            };

            if (userRole === 'ROLE_PRO') {
              result.professional = decryptedUserData.professional || {
                company_name: '',
                medical_identification_number: '',
                biography: '',
                experience: 0,
                certification: '',
                languages: ['Français'],
                specialties: [],
                is_anonymous: false,
              };
              result.patient = null;
            } else if (userRole === 'ROLE_PATIENT') {
              result.patient = decryptedUserData.patient || {
                gender: '',
                birthdate: null,
                is_anonymous: false,
              };
              result.professional = null;
            }

            return result;
          } catch (error) {
            console.error('Erreur de déchiffrement:', error);
            throw error;
          }
        }),
        catchError(error => {
          console.error('Erreur détaillée:', {
            status: error.status,
            message: error.message,
            body: error.error,
          });
          return throwError(() => error);
        }),
        finalize(() => console.groupEnd())
      );
  }

  changePassword(data: PasswordChangeRequest): Observable<PasswordChangeResponse> {
    return this.http
      .post<PasswordChangeResponse>(`${this.profileUrl}/change-password`, data, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError(error => {
          console.error('Erreur lors du changement de mot de passe:', error);
          return throwError(() => error);
        })
      );
  }

  toggleAnonymousMode(): Observable<AnonymousModeResponse> {
    return this.http
      .post<AnonymousModeResponse>(
        `${this.profileUrl}/toggle-anonymous`,
        {},
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError(error => {
          console.error('Erreur lors du basculement du mode anonyme:', error);
          return throwError(() => error);
        })
      );
  }

  updateBasicInfo(data: any): Observable<any> {
    return this.http.put(`${this.profileUrl}/basic`, data, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur lors de la mise à jour des informations de base:', error);
        return throwError(() => error);
      })
    );
  }

  updatePatientProfile(data: any): Observable<any> {
    return this.http.put(`${this.profileUrl}/patient`, data, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur lors de la mise à jour du profil patient:', error);
        return throwError(() => error);
      })
    );
  }

  updateProfessionalProfile(data: any): Observable<any> {
    return this.http
      .put(`${this.profileUrl}/professional`, data, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la mise à jour du profil professionnel:', error);
          return throwError(() => error);
        })
      );
  }
}
