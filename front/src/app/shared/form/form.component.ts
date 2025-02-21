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
    let control: FormControl<string | null> = this.fb.control(null);

    this.config.fields.forEach((fieldGroup) => {
      fieldGroup.fields.forEach((field) => {
        if (field.options) {
          control = this.fb.control(
            field.type === 'select' ? field.options[0] : '',
            (field.validators as unknown as AValidatorFn) || [],
          );
        } else {
          control = this.fb.control(
            '',
            (field.validators as unknown as AValidatorFn) || [],
          );
        }
        if (!group[fieldGroup.group]) {
          group[fieldGroup.group] = this.fb.group({});
        }
        group[fieldGroup.group].addControl(field.name, control);
      });
    });

    this.form = this.fb.group(group, {
      validators: this.passwordMatchValidator,
    });
  }

  initForm(): void {
    const formGroups = this.config.fields.reduce((groups, group) => {
      const formControls = group.fields.reduce<FormControls>(
        (controls, field) => {
          controls[field.name] = this.fb.control(
            '',
            (field.validators as unknown as AValidatorFn) || [],
          );
          return controls;
        },
        {},
      );
      groups[group.group] = this.fb.group(formControls);
      return groups;
    }, {} as FormGroups);

    this.form = this.fb.group(formGroups, {
      validators: this.passwordMatchValidator,
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.form.valid) {
      this.formSubmit.emit(this.form);
    } else {
      const controls = this.form.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          controls[name].markAsTouched();
        }
      }
    }
  }

  onCancel(): void {
    this.form.reset();
  }

  onNext(): void {
    this.groupSubmitted = true;
    const currentGroup = this.config.fields[this.currentGroupIndex].group;
    if (this.form.get(currentGroup)?.invalid) {
      this.form.get(currentGroup)?.markAllAsTouched();
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

  passwordMatchValidator: AValidatorFn = (
    form: AbstractControl,
  ): ValidationErrors | null => {
    const password = form.get('identity.password');
    const confirmPassword = form.get('identity.confirm_password');
    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      confirmPassword?.setErrors(null);
      return null;
    }
  };
}