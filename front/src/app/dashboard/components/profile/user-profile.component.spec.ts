import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserProfileComponent } from './user-profile.component';
import { ProfileService } from '@services/profile.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Mock profile data for testing
  const mockPatientProfile = {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    phone: '0123456789',
    address: '123 Test Street',
    address_complement: 'Apt 4B',
    zipcode: '75001',
    city: 'Paris',
    country: 'France',
    avatar: 'assets/images/test-avatar.jpg',
    professional: null,
    patient: {
      gender: 'M',
      birthdate: '1990-01-01',
      is_anonymous: false
    }
  };

  const mockProfessionalProfile = {
    firstname: 'Jane',
    lastname: 'Smith',
    email: 'jane.smith@example.com',
    phone: '9876543210',
    address: '456 Pro Street',
    address_complement: 'Suite 7',
    zipcode: '75002',
    city: 'Paris',
    country: 'France',
    avatar: 'assets/images/pro-avatar.jpg',
    patient: null,
    professional: {
      company_name: 'Health Clinic',
      medical_identification_number: 'MC12345',
      biography: 'Experienced health professional',
      experience: 10,
      certification: 'Board Certified',
      languages: ['French', 'English'],
      specialties: ['General Medicine'],
      availability_hours: {}
    }
  };

  beforeEach(async () => {
    // Create spies for the ProfileService and Router
    profileServiceSpy = jasmine.createSpyObj('ProfileService', [
      'getProfile',
      'updateBasicInfo',
      'updateProfessionalProfile',
      'updatePatientProfile'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule
      ],
      declarations: [
        UserProfileComponent
      ],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements like app-navbar and app-footer
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load patient profile data on init', fakeAsync(() => {
      profileServiceSpy.getProfile.and.returnValue(of(mockPatientProfile));

      fixture.detectChanges(); // Trigger ngOnInit
      tick(); // Wait for observables to complete

      expect(component.profileData.firstname).toBe('John');
      expect(component.profileData.lastname).toBe('Doe');
      expect(component.profileData.patient).toBeTruthy();
      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBeNull();
    }));

    it('should load professional profile data on init', fakeAsync(() => {
      profileServiceSpy.getProfile.and.returnValue(of(mockProfessionalProfile));

      fixture.detectChanges();
      tick();

      expect(component.profileData.firstname).toBe('Jane');
      expect(component.profileData.lastname).toBe('Smith');
      expect(component.profileData.professional).toBeTruthy();
      expect(component.loading).toBeFalse();
    }));

    it('should handle error when loading profile fails', fakeAsync(() => {
      profileServiceSpy.getProfile.and.returnValue(throwError(() => new Error('Profile load error')));

      fixture.detectChanges();
      tick();

      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBe('Impossible de charger les données du profil.');
    }));

    it('should initialize activeSection to personal by default', () => {
      expect(component.activeSection).toBe('personal');
    });

    it('should use default avatar when none provided from API', fakeAsync(() => {
      const profileWithoutAvatar = { ...mockPatientProfile, avatar: null };
      profileServiceSpy.getProfile.and.returnValue(of(profileWithoutAvatar));

      component.userAvatar = 'assets/images/default-avatar.jpg';
      fixture.detectChanges();
      tick();

      expect(component.profileData.avatar).toBe('assets/images/default-avatar.jpg');
    }));
  });

  describe('form operations', () => {
    beforeEach(fakeAsync(() => {
      profileServiceSpy.getProfile.and.returnValue(of(mockPatientProfile));
      fixture.detectChanges();
      tick();
    }));

    it('should save basic profile information', fakeAsync(() => {
      profileServiceSpy.updateBasicInfo.and.returnValue(of({}));
      profileServiceSpy.updatePatientProfile.and.returnValue(of({}));

      component.saveProfile();
      tick();

      expect(profileServiceSpy.updateBasicInfo).toHaveBeenCalled();
      expect(profileServiceSpy.updatePatientProfile).toHaveBeenCalled();
      expect(component.successMessage).toBe('Profil mis à jour avec succès');
    }));

    it('should handle error when saving basic info fails', fakeAsync(() => {
      profileServiceSpy.updateBasicInfo.and.returnValue(throwError(() => new Error('Update error')));

      component.saveProfile();
      tick();

      expect(component.errorMessage).toBe('Erreur lors de la mise à jour du profil');
      expect(component.loading).toBeFalse();
    }));

    it('should reset form to original values', fakeAsync(() => {
      component.profileData.firstname = 'Changed';
      component.profileData.lastname = 'Name';

      component.resetForm();

      expect(component.profileData.firstname).toBe('John');
      expect(component.profileData.lastname).toBe('Doe');
    }));
  });

  describe('professional profile', () => {
    beforeEach(fakeAsync(() => {
      profileServiceSpy.getProfile.and.returnValue(of(mockProfessionalProfile));
      fixture.detectChanges();
      tick();
    }));

    it('should save professional profile data', fakeAsync(() => {
      profileServiceSpy.updateBasicInfo.and.returnValue(of({}));
      profileServiceSpy.updateProfessionalProfile.and.returnValue(of({}));

      component.saveProfile();
      tick();

      expect(profileServiceSpy.updateBasicInfo).toHaveBeenCalled();
      expect(profileServiceSpy.updateProfessionalProfile).toHaveBeenCalled();
      expect(component.successMessage).toBe('Profil mis à jour avec succès');
    }));

    it('should handle error when saving professional profile fails', fakeAsync(() => {
      profileServiceSpy.updateBasicInfo.and.returnValue(of({}));
      profileServiceSpy.updateProfessionalProfile.and.returnValue(
        throwError(() => new Error('Professional update error'))
      );

      component.saveProfile();
      tick();

      expect(component.errorMessage).toBe('Erreur lors de la mise à jour du profil professionnel');
    }));
  });

  describe('avatar handling', () => {
    it('should show a message when trying to change avatar', () => {
      const mockEvent = {
        target: {
          files: [new File([''], 'test.jpg', { type: 'image/jpeg' })]
        }
      };

      component.onAvatarChange(mockEvent);

      expect(component.successMessage).toBe('Fonctionnalité de changement de photo non implémentée');
    });
  });

  describe('edge cases', () => {
    it('should handle empty response from API', fakeAsync(() => {
      profileServiceSpy.getProfile.and.returnValue(of(null));

      fixture.detectChanges();
      tick();

      expect(component.errorMessage).toBe('Impossible de charger les données du profil.');
    }));

    it('should properly initialize empty objects for patient/professional', () => {
      component.profileData = { firstname: 'Test', patient: null, professional: null };
      component.initializeEmptyObjects();

      expect(component.profileData.patient).toBeDefined();
      expect(component.profileData.professional).toBeDefined();
    });
  });
});
