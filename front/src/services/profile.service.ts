import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap, finalize } from 'rxjs/operators';
import { environment } from '../../environnement';
import { AnonymousModeResponse } from '@interfaces/anonymous.interface';
import { DecryptionService } from '@services/decryption.service';

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface PasswordChangeResponse {
  message?: string;
}

export interface DeleteAccountRequest {
  password: string;
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
    console.log('URL de la requête:', `${this.profileUrl}/me`);

    return this.http
      .get(`${this.profileUrl}/me`, {
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
      .post<PasswordChangeResponse>(
        `${this.authUrl}/renew-password`,
        {
          // Changement ici
          currentPassword: data.current_password,
          newPassword: data.new_password,
        },
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        catchError(error => {
          console.error('Erreur lors du changement de mot de passe:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Supprime le compte de l'utilisateur
   * @param password Mot de passe pour confirmation
   * @returns Observable avec la réponse
   */
  deleteAccount(password: string): Observable<any> {
    return this.http
      .post<any>(
        `${this.profileUrl}/delete`,
        { password },
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la suppression du compte:', error);
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
