import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormComponent } from './form.component';
import { IFormConfig, ValidatorFn } from '@interfaces/form.interface';
import { DebugElement } from '@angular/core';

describe('FormComponent', (): void => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  const mockConfig: IFormConfig = {
    fields: [
      {
        group: 'identity',
        label: 'User Information',
        fields: [
          {
            name: 'email',
            type: 'text',
            label: 'Email',
            validators: [
              Validators.required as unknown as ValidatorFn,
              Validators.email as unknown as ValidatorFn,
            ],
          },
          {
            name: 'password',
            type: 'password',
            label: 'Password',
            validators: [Validators.required as unknown as ValidatorFn],
          },
          {
            name: 'confirm_password',
            type: 'password',
            label: 'Confirm Password',
            validators: [Validators.required as unknown as ValidatorFn],
          },
        ],
      },
      {
        group: 'preferences',
        label: 'Preferences',
        fields: [
          {
            name: 'language',
            type: 'select',
            label: 'Language',
            options: ['English', 'French', 'Spanish'],
          },
        ],
      },
    ],
    submitLabel: 'Submit',
    styles: '',
    isIndexed: true,
  };

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    component.config = mockConfig;
    fixture.detectChanges();
  });

  it('should create the component', (): void => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', (): void => {
    it('should initialize form with fields from config', (): void => {
      expect(component.form.get('identity')).toBeTruthy();
      expect(component.form.get('preferences')).toBeTruthy();
    });
  });

  describe('Field Interactions', (): void => {
    it('should update email field value on input', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 0;
      fixture.detectChanges();

      const emailField = component.form.get('identity.email');
      const emailInput = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();
      expect(emailField?.value).toBe('test@example.com');
    }));

    it('should display required error for empty email field', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 0;
      fixture.detectChanges();

      const emailField = component.form.get('identity.email');
      emailField?.markAsTouched();
      emailField?.setValue('');
      tick();
      fixture.detectChanges();

      const errorMessage: DebugElement = fixture.debugElement.query(
        By.css('label[for="email"] .text-red-600')
      );
      expect(errorMessage.nativeElement.textContent.trim()).toBe('*');
    }));

    it('should show email validation error for invalid email format', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 0;
      fixture.detectChanges();

      const emailField = component.form.get('identity.email');
      emailField?.setValue('invalid-email');
      emailField?.markAsTouched();
      tick();
      fixture.detectChanges();

      const emailError: DebugElement = fixture.debugElement.query(By.css('.text-red-600'));
      expect(emailError.nativeElement.textContent.trim()).toContain(
        'Veuillez entrer une adresse e-mail valide'
      );
    }));
  });

  describe('Password Match Validator', (): void => {
    it('should show mismatch error when passwords do not match', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 0;

      component.initForm();
      fixture.detectChanges();

      component.form.patchValue({
        identity: {
          email: 'test@test.com',
          password: 'password123',
          confirm_password: 'differentPassword',
        },
      });

      const identityGroup = component.form.get('identity') as FormGroup;
      Object.keys(identityGroup.controls || {}).forEach(key => {
        const control = identityGroup?.get(key);
        control?.markAsTouched();
        control?.markAsDirty();
      });

      component.form.updateValueAndValidity();
      tick();
      fixture.detectChanges();

      const confirmPasswordControl = component.form.get('identity.confirm_password');
      expect(confirmPasswordControl?.errors?.['mismatch']).toBeTruthy(
        'Expected mismatch error to be present'
      );

      const errorMessage: DebugElement = fixture.debugElement.query(
        By.css(`div.text-red-600 div:last-child`)
      );

      expect(errorMessage.nativeElement.textContent.trim()).toBe(
        'Les mots de passe ne correspondent pas.'
      );
    }));

    it('should not show mismatch error when passwords match', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 0;
      fixture.detectChanges();

      const passwordField = component.form.get('identity.password');
      const confirmPasswordField = component.form.get('identity.confirm_password');

      passwordField?.setValue('password123');
      confirmPasswordField?.setValue('password123');
      confirmPasswordField?.markAsTouched();
      component.form.updateValueAndValidity();
      tick();
      fixture.detectChanges();

      const errorMessage: DebugElement = fixture.debugElement.query(
        By.css('div.form-group div.text-red-600 div:last-child')
      );
      expect(errorMessage).toBeFalsy();
    }));
  });

  describe('Select Field', (): void => {
    it('should display options in language select field', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 1;
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('#language')).nativeElement;
      expect(select.options.length).toBe(3);
    }));

    it('should update form control value when an option is selected', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 1;
      fixture.detectChanges();

      const languageField = component.form.get('preferences.language');
      const select = fixture.debugElement.query(By.css('#language')).nativeElement;

      select.value = select.options[1].value;
      select.dispatchEvent(new Event('change'));
      tick();
      fixture.detectChanges();
      expect(languageField?.value).toBe('French');
    }));
  });

  describe('Button Actions', () => {
    it('should emit formSubmit when the form is valid and submit button is clicked', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 1;
      fixture.detectChanges();

      spyOn(component.formSubmit, 'emit');

      component.form.get('identity.email')?.setValue('test@example.com');
      component.form.get('identity.password')?.setValue('password123');
      component.form.get('identity.confirm_password')?.setValue('password123');
      component.form.get('preferences.language')?.setValue('English');

      fixture.detectChanges();
      const submitButton: DebugElement = fixture.debugElement.query(
        By.css('button[type="submit"]')
      );
      submitButton.nativeElement.click();
      tick();
      fixture.detectChanges();

      expect(component.formSubmit.emit).toHaveBeenCalledWith(component.form);
    }));

    it('should reset form values when navigating groups', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 0;
      fixture.detectChanges();

      spyOn(component.form, 'reset');
      component.onCancel();
      tick();
      fixture.detectChanges();

      expect(component.form.reset).toHaveBeenCalled();
    }));
  });

  describe('Form Group Navigation', (): void => {
    it('should go to next group on onNext if current group is valid', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 0;
      fixture.detectChanges();

      component.form.get('identity.email')?.setValue('test@example.com');
      component.form.get('identity.password')?.setValue('password123');
      component.form.get('identity.confirm_password')?.setValue('password123');
      fixture.detectChanges();

      component.onNext();
      tick();
      fixture.detectChanges();
      expect(component.currentGroupIndex).toBe(1);
    }));

    it('should not go to next group on onNext if current group is invalid', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 0;
      fixture.detectChanges();

      component.onNext();
      tick();
      fixture.detectChanges();
      expect(component.currentGroupIndex).toBe(0);
    }));

    it('should go to previous group on onPrevious', fakeAsync(async (): Promise<void> => {
      await fixture.whenStable();
      component.currentGroupIndex = 1;
      fixture.detectChanges();

      component.onPrevious();
      expect(component.currentGroupIndex).toBe(0);
    }));
  });
});
