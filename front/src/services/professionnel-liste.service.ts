import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Professional {
  id: number;
  firstname: string;
  lastname: string;
  rating: number;
  experience: number;
  verified_diplomas: boolean;
  approaches: string[];
  themes: string[];
  specialties: string[];
  avatar: string;
  gender: string;
  biography: string;
  company_name: string;
  medical_identification_number: string;
  languages: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ProfessionalsService {
  private apiUrl = 'http://localhost:8000/api';

  // Données des filtres (pour développement)
  private symptomsData: string[] = [
    'Anxiété',
    'Dépression',
    'Stress',
    'Traumatisme',
    'Burn-out',
    'Troubles du sommeil',
    'Phobie',
    'Dépendance émotionnelle',
    "Crise d'angoisse",
    'Troubles alimentaires',
    'Gestion de la colère',
  ];

  private approachesData: string[] = [
    'Thérapie cognitivo-comportementale',
    'Gestalt-thérapie',
    'Psychanalyse',
    'Thérapie systémique',
    'EMDR',
    'Hypnose',
    'Pleine conscience',
    'Approche humaniste',
    'Approche systémique de la famille',
    'Thérapie brève',
  ];

  // Données mockées pour le développement
  private mockProfessionals: Professional[] = [
    {
      id: 1,
      firstname: 'Jean',
      lastname: 'Dupont',
      rating: 9.8,
      experience: 5,
      verified_diplomas: true,
      approaches: ['Gestalt-thérapie', 'Approche systémique de la famille'],
      themes: ["Peur et crises d'angoisse", 'Dépendance émotionnelle', 'Stress'],
      specialties: ['Thérapie de couple'],
      avatar: '',
      gender: 'M',
      biography:
        "Psychologue clinicien avec 5 ans d'expérience, je vous accompagne dans votre chemin vers le bien-être émotionnel. Spécialisé dans la gestion du stress et de l'anxiété.",
      company_name: 'Cabinet de Psychologie Jean Dupont',
      medical_identification_number: '123456',
      languages: ['Français', 'Anglais'],
    },
    {
      id: 2,
      firstname: 'Marie',
      lastname: 'Martin',
      rating: 9.5,
      experience: 8,
      verified_diplomas: true,
      approaches: ['Thérapie cognitivo-comportementale'],
      themes: ['Anxiété', 'Dépression', 'Troubles du sommeil'],
      specialties: ['Troubles anxieux'],
      avatar: '',
      gender: 'F',
      biography:
        "Psychologue spécialisée en TCC, j'utilise des approches scientifiquement validées pour traiter l'anxiété et la dépression.",
      company_name: 'Centre Psychologique Parisien',
      medical_identification_number: '654321',
      languages: ['Français'],
    },
    {
      id: 3,
      firstname: 'Paul',
      lastname: 'Leroy',
      rating: 9.2,
      experience: 12,
      verified_diplomas: true,
      approaches: ['Psychanalyse', 'EMDR'],
      themes: ['Traumatisme', 'Deuil', 'Relations familiales'],
      specialties: ['Thérapie des traumatismes'],
      avatar: '',
      gender: 'M',
      biography:
        "Psychologue et psychanalyste avec une expertise dans le traitement des traumatismes. J'utilise également l'EMDR pour aider mes patients à surmonter les événements difficiles.",
      company_name: 'Cabinet Leroy',
      medical_identification_number: '789012',
      languages: ['Français', 'Allemand'],
    },
  ];

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Obtenir tous les professionnels (utilise les données mockées pour le développement)
  getProfessionals(): Observable<Professional[]> {
    // Option 1: Utiliser les données mockées pour le développement
    return of(this.mockProfessionals).pipe(
      catchError(this.handleError<Professional[]>('getProfessionals', []))
    );

    // Option 2: Utiliser l'API réelle
    /*
    return this.http.get<Professional[]>(`${this.apiUrl}/professionals`, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError<Professional[]>('getProfessionals', []))
      );
    */
  }

  // Obtenir un professionnel par son ID
  getProfessionalById(id: number): Observable<Professional | undefined> {
    // Option 1: Utiliser les données mockées pour le développement
    const professional = this.mockProfessionals.find(p => p.id === id);
    return of(professional).pipe(
      catchError(this.handleError<Professional | undefined>('getProfessionalById'))
    );

    // Option 2: Utiliser l'API réelle
    /*
    return this.http.get<Professional>(`${this.apiUrl}/professionals/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError<Professional>('getProfessionalById'))
      );
    */
  }

  // Obtenir les symptômes disponibles pour le filtre
  getSymptoms(): string[] {
    return this.symptomsData;
  }

  // Obtenir les approches disponibles pour le filtre
  getApproaches(): string[] {
    return this.approachesData;
  }

  // Gestionnaire d'erreur privé
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error("Détails complets de l'erreur:", error);
      return of(result as T);
    };
  }
}
