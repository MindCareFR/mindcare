import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { ContactComponent } from './contact.component';
import {FormComponent} from '@shared/form/form.component';
import {ContactService} from '@services/contact.service';
import {ToastService} from '@services/toast.service';


describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let mockContactService: jasmine.SpyObj<ContactService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {

    mockContactService = jasmine.createSpyObj('ContactService', ['sendMessage']);
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ContactComponent,
        FormComponent
      ],
      providers: [
        { provide: ContactService, useValue: mockContactService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a valid contact configuration', () => {
    expect(component.contactConfig).toBeTruthy();
    expect(component.contactConfig.fields[0].fields.length).toBeGreaterThan(0);
  });

  describe('Form Submission', () => {
    it('should send message when form is valid', () => {
      // Préparer un formulaire valide
      const mockForm = {
        valid: true,
        value: {
          contact: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            subject: 'Support technique',
            message: 'Ceci est un message de test avec plus de 20 caractères'
          }
        },
        reset: jasmine.createSpy('reset')
      } as any;

      mockContactService.sendMessage.and.returnValue(of({}));

      // Appeler la méthode de soumission
      component.onFormSubmit(mockForm);

      // Vérifier que le service a été appelé avec les bonnes données
      expect(mockContactService.sendMessage).toHaveBeenCalledWith(mockForm.value.contact);

      // Vérifier que le toast de succès a été appelé
      expect(mockToastService.success).toHaveBeenCalledWith('Votre message a bien été envoyé');

      // Vérifier que le formulaire a été réinitialisé
      expect(mockForm.reset).toHaveBeenCalled();
    });

    it('should handle submission error', () => {
      // Préparer un formulaire valide
      const mockForm = {
        valid: true,
        value: {
          contact: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            subject: 'Support technique',
            message: 'Ceci est un message de test avec plus de 20 caractères'
          }
        }
      } as any;

      // Simuler une erreur de service
      mockContactService.sendMessage.and.returnValue(throwError(() => new Error('Erreur de service')));

      // Appeler la méthode de soumission
      component.onFormSubmit(mockForm);

      // Vérifier que le toast d'erreur a été appelé
      expect(mockToastService.error).toHaveBeenCalledWith('Une erreur est survenue lors de l\'envoi');
    });

    it('should not submit when form is invalid', () => {
      // Préparer un formulaire invalide
      const mockForm = {
        valid: false,
        value: {}
      } as any;

      // Appeler la méthode de soumission
      component.onFormSubmit(mockForm);

      // Vérifier que le service n'a pas été appelé
      expect(mockContactService.sendMessage).not.toHaveBeenCalled();

      // Vérifier que le toast d'erreur a été appelé
      expect(mockToastService.error).toHaveBeenCalledWith('Veuillez remplir correctement tous les champs');
    });
  });
});
