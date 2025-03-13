import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  AbstractControl,
  ValidationErrors,
  FormControl,
  ValidatorFn as AValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IFormConfig } from '@interfaces/form.interface';

type FormControls = Record<string, AbstractControl>;
type FormGroups = Record<string, FormGroup>;

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class FormComponent implements OnInit, OnChanges {
  @Input() config: IFormConfig = {
    fields: [],
    submitLabel: '',
    styles: '',
    isIndexed: false,
  };
  @Output() formSubmit: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  @Input() currentGroupIndex = 0;
  @Output() currentGroupIndexChange = new EventEmitter<number>();
  @Input() formError: string | null = null;

  form: FormGroup;
  formSubmitted = false;
  groupSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.initForm();
    }
  }

  createForm(): void {
    const group: FormGroups = {};
    
    this.config.fields.forEach((fieldGroup) => {
      if (!group[fieldGroup.group]) {
        group[fieldGroup.group] = this.fb.group({});
      }
      
      fieldGroup.fields.forEach((field) => {
        let defaultValue: string | number | boolean = field.defaultValue || '';
        
        if (field.type === 'select' && field.options && field.options.length > 0 && !defaultValue) {
          defaultValue = field.options[0];
        }
        
        if (field.type === 'checkbox') {
          defaultValue = false;
        }
        
        const control = this.fb.control(
          defaultValue,
          (field.validators as unknown as AValidatorFn) || []
        );
        
        group[fieldGroup.group].addControl(field.name, control);
      });
    });

    this.form = this.fb.group(group, {
      validators: this.passwordMatchValidator,
    });
    
    // console.log('Formulaire créé:', this.form);
  }

  initForm(): void {
    this.createForm();
  }

  onSubmit(): void {
    this.formSubmitted = true;
    
    // console.log('Soumission du formulaire:', this.form);
    // console.log('Formulaire valide:', this.form.valid);
    
    const legalGroup = this.form.get('legal');
    if (legalGroup) {
      Object.keys((legalGroup as FormGroup).controls).forEach(key => {
        legalGroup.get(key)?.markAsTouched();
      });
      
      if (legalGroup.invalid) {
        const legalGroupIndex = this.config.fields.findIndex(field => field.group === 'legal');
        if (legalGroupIndex !== -1) {
          this.currentGroupIndex = legalGroupIndex;
          this.currentGroupIndexChange.emit(legalGroupIndex);
          console.log('Groupe legal invalide, cases à cocher non cochées.');
          return;
        }
      }
    }
    
    if (this.config.isIndexed && this.currentGroupIndex < this.config.fields.length - 1) {
      this.currentGroupIndex = this.config.fields.length - 1;
      this.currentGroupIndexChange.emit(this.currentGroupIndex);
      this.formSubmitted = false; 
      return;
    }
    
    if (this.config.isIndexed) {
      const currentGroup = this.config.fields[this.currentGroupIndex].group;
      const groupControl = this.form.get(currentGroup);
      
      if (groupControl && groupControl.invalid) {
        this.markFormGroupTouched(groupControl as FormGroup);
        console.log(`Groupe ${currentGroup} invalide:`, this.getFormValidationErrors());
        return;
      }
    }
    
    if (this.form.valid) {
      const password = this.getNestedControl(this.form, 'password');
      const passwordConfirmation = this.getNestedControl(this.form, 'password_confirmation');
      
      if (password && passwordConfirmation && password.value !== passwordConfirmation.value) {
        console.log('Les mots de passe ne correspondent pas');
        if (passwordConfirmation.errors) {
          passwordConfirmation.errors['mismatch'] = true;
        } else {
          passwordConfirmation.setErrors({ mismatch: true });
        }
        return;
      }
      
      this.formSubmit.emit(this.form);
    } else {
      this.markFormGroupTouched(this.form);
      console.log('Formulaire invalide, erreurs:', this.getFormValidationErrors());
      
      if (this.config.isIndexed) {
        for (let i = 0; i < this.config.fields.length; i++) {
          const groupName = this.config.fields[i].group;
          const groupControl = this.form.get(groupName);
          
          if (groupControl && groupControl.invalid) {
            console.log(`Navigation vers le groupe invalide: ${groupName} (index: ${i})`);
            this.currentGroupIndex = i;
            this.currentGroupIndexChange.emit(this.currentGroupIndex);
            break;
          }
        }
      }
    }
  }

  onCancel(): void {
    this.form.reset();
    this.formSubmitted = false;
  }

  onNext(): void {
    this.groupSubmitted = true;
    const currentGroup = this.config.fields[this.currentGroupIndex].group;
    const groupControl = this.form.get(currentGroup);
    
    if (groupControl && groupControl.invalid) {
      this.markFormGroupTouched(groupControl as FormGroup);
      console.log(`Groupe ${currentGroup} invalide:`, this.getFormValidationErrors().filter(err => err.group === currentGroup));
    } else {
      this.currentGroupIndex++;
      this.currentGroupIndexChange.emit(this.currentGroupIndex);
      this.groupSubmitted = false;
    }
  }

  onPrevious(): void {
    if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
      this.currentGroupIndexChange.emit(this.currentGroupIndex);
      this.groupSubmitted = false;
    }
  }

  isLastGroup(): boolean {
    return this.currentGroupIndex === this.config.fields.length - 1;
  }

  isFirstGroup(): boolean {
    return this.currentGroupIndex === 0;
  }

  hasFormErrors(): boolean {
    return Object.keys(this.form.controls).some((group) => {
      const groupControl = this.form.get(group) as FormGroup;
      return Object.keys(groupControl.controls).some(
        (field) => groupControl.get(field)?.invalid,
      );
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control) {
        control.markAsTouched();
      }
    });
  }

  getNestedControl(form: FormGroup, controlName: string): AbstractControl | null {
    const control = form.get(controlName);
    if (control) return control;
    
    for (const key of Object.keys(form.controls)) {
      const childControl = form.get(key);
      if (childControl instanceof FormGroup) {
        const nestedControl = this.getNestedControl(childControl, controlName);
        if (nestedControl) return nestedControl;
      }
    }
    
    return null;
  }

  getFormValidationErrors() {
    const errors: any[] = [];
    
    Object.keys(this.form.controls).forEach(groupKey => {
      const groupControl = this.form.get(groupKey);
      
      if (groupControl instanceof FormGroup) {
        Object.keys(groupControl.controls).forEach(controlKey => {
          const control = groupControl.get(controlKey);
          
          if (control && control.errors) {
            errors.push({
              group: groupKey,
              control: controlKey,
              errors: control.errors,
              value: control.value
            });
          }
        });
      }
    });
    
    return errors;
  }

  passwordMatchValidator: AValidatorFn = (
    form: AbstractControl,
  ): ValidationErrors | null => {
    const password = this.getNestedControl(form as FormGroup, 'password');
    const confirmPassword = this.getNestedControl(form as FormGroup, 'password_confirmation');
    
    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ mismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  };

  onCheckboxChange(event: Event, groupName: string, fieldName: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    console.log(`Checkbox ${fieldName} changed to: ${checked}`);
    
    const control = this.form.get(groupName)?.get(fieldName);
    if (control) {
      control.setValue(checked);
      control.markAsDirty();
      control.markAsTouched();
      
      if (checked) {
        control.setErrors(null);
      } else {
        control.setErrors({ requiredTrue: true });
      }
      
      this.form.updateValueAndValidity();
      
      console.log(`Control ${fieldName} updated:`, control.value);
      console.log(`Is valid: ${control.valid}`);
    }
  }
}