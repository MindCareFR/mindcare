import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import type { IFormConfig, IFormField, IFormGroup } from '@interfaces/form.interface';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class FormComponent implements OnInit {
  @Input() config: IFormConfig = { fields: [], submitLabel: '', styles: '' };
  @Output() formSubmit: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

  form: FormGroup;
  formSubmitted: boolean = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    this.initForm();
  }

  initForm(): void {
    const formGroups = this.config.fields.reduce((groups, group) => {
      const formControls = group.fields.reduce((controls, field) => {
        controls[field.name] = this.fb.control('', field.validators || []);
        return controls;
      }, {} as { [key: string]: AbstractControl });
      groups[group.group] = this.fb.group(formControls);
      return groups;
    }, {} as { [key: string]: FormGroup });

    this.form = this.fb.group(formGroups, { validators: this.passwordMatchValidator });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.form.valid) {
      this.formSubmit.emit(this.form);
    } else {
      let controls = this.form.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          controls[name].markAsTouched();
        }
      }
    }
  }

  hasFormErrors(): boolean {
    return Object.keys(this.form.controls).some(group => {
      const groupControl = this.form.get(group) as FormGroup;
      return Object.keys(groupControl.controls).some(field => groupControl.get(field)?.invalid);
    });
  }

  passwordMatchValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
    const password = form.get('identity.password');
    const confirmPassword = form.get('identity.confirm_password');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      confirmPassword?.setErrors(null);
      return null;
    }
  };
}