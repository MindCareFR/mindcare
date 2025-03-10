import { ComponentFixture, TestBed } from '@angular/core/testing';
import {NotFoundComponent} from './page404.component';
import {RouterTestingModule} from '@angular/router/testing';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NotFoundComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;


    spyOn(console, 'error').and.callFake(() => {});

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have appName property set', () => {
    expect(component.appName).toBe('MindCare');
  });

  it('should contain 404 text in the header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('404');
  });

  it('should have links to home and contact pages', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a');

    const homeLink = Array.from(links).find(link =>
      link.getAttribute('routerLink') === '/');
    expect(homeLink).toBeTruthy();

    const contactLink = Array.from(links).find(link =>
      link.getAttribute('routerLink') === '/contact');
    expect(contactLink).toBeTruthy();
  });

});
