import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
import { ConferenceComponent } from './conference.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { VideoComponent } from '@shared/video/video.component';
import { FormComponent } from '@shared/form/form.component';
import { MedicalRecordComponent } from '@shared/medical-record/medical-record.component';
import { ProgressStatComponent } from '@shared/progress-stat/progress-stat.component';
import { ChatComponent } from '@shared/chat/chat.component';

describe('ConferenceComponent', (): void => {
  let component: ConferenceComponent;
  let fixture: ComponentFixture<ConferenceComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FontAwesomeModule,
        VideoComponent,
        FormComponent,
        MedicalRecordComponent,
        ProgressStatComponent,
        ChatComponent,
        ConferenceComponent,
      ],
    }).compileComponents();
  });

  beforeEach((): void => {
    fixture = TestBed.createComponent(ConferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the ConferenceComponent', (): void => {
    expect(component).toBeTruthy();
  });

  it('should initialize the prescription form correctly', (): void => {
    expect(component.prescriptionForm).toBeDefined();
    expect(component.prescriptions.length).toBe(1);
  });

  it('should create a new prescription group', (): void => {
    const prescriptionGroup = component.createPrescriptionGroup();
    expect(prescriptionGroup).toBeDefined();
    expect(prescriptionGroup.get('drug')?.value).toBe('');
    expect(prescriptionGroup.get('dosage')?.value).toBe('');
    expect(prescriptionGroup.get('duration')?.value).toBe('');
    expect(prescriptionGroup.get('comment')?.value).toBe('');
  });

  it('should toggle mute', (): void => {
    const mockAudioTrack = {
      enabled: true,
    };

    component.localStream = {
      getAudioTracks: () => [mockAudioTrack],
    } as unknown as MediaStream;

    component.toggleMute();
    expect(component.muted).toBe(true);
    expect(mockAudioTrack.enabled).toBe(false);

    component.toggleMute();
    expect(component.muted).toBe(false);
    expect(mockAudioTrack.enabled).toBe(true);
  });

  it('should hang up and show satisfaction form after a delay', (done): void => {
    spyOn(component, 'hangUp').and.callThrough();
    component.hangUp();
    expect(component.callEnded).toBe(true);

    setTimeout((): void => {
      expect(component.showSatisfactionForm).toBe(true);
      done();
    }, 3000);
  });

  it('should toggle side dashboard', (): void => {
    expect(component.isSideDashboardOpen).toBe(false);
    component.toggleSideDashboard();
    expect(component.isSideDashboardOpen).toBe(true);
    component.toggleSideDashboard();
    expect(component.isSideDashboardOpen).toBe(false);
  });

  it('should add a prescription', (): void => {
    const initialLength = component.prescriptions.length;
    component.addPrescription();
    expect(component.prescriptions.length).toBe(initialLength + 1);
  });

  it('should remove a prescription', (): void => {
    component.addPrescription();
    const initialLength = component.prescriptions.length;
    component.removePrescription(0);
    expect(component.prescriptions.length).toBe(initialLength - 1);
  });

  it('should submit prescription form and emit event if valid', (): void => {
    spyOn(component.prescriptionSubmit, 'emit');
    component.prescriptionForm.controls['prescriptions'].setValue([
      {
        drug: 'Aspirin',
        dosage: '500mg',
        duration: '7 days',
        comment: '',
      },
    ]);
    component.onSubmitPrescription();
    expect(component.prescriptionSubmit.emit).toHaveBeenCalledWith(
      component.prescriptionForm,
    );
  });

  it('should mark all as touched if prescription form is invalid', (): void => {
    component.prescriptionForm.controls['prescriptions'].setValue([
      { drug: '', dosage: '', duration: '', comment: '' },
    ]);
    component.onSubmitPrescription();
    expect(component.prescriptionFormSubmitted).toBe(true);
    const controls = component.prescriptionForm.get(
      'prescriptions',
    ) as FormArray;
    controls.controls.forEach((control): void => {
      expect(control.touched).toBe(true);
    });
  });

  it('should check for prescription form errors', (): void => {
    component.prescriptionForm.controls['prescriptions'].setValue([
      { drug: '', dosage: '', duration: '', comment: '' },
    ]);
    expect(component.hasPrescriptionFormErrors()).toBe(true);
  });
});