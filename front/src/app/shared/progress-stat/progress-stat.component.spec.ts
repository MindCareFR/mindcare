import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressStatComponent } from './progress-stat.component';

describe('ProgressStatComponent', () => {
  let component: ProgressStatComponent;
  let fixture: ComponentFixture<ProgressStatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressStatComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});