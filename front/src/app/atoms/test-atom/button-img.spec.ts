import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonImgComponent } from './button-img';

describe('ButtonImgComponent', () => {
  let component: ButtonImgComponent;
  let fixture: ComponentFixture<ButtonImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonImgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
