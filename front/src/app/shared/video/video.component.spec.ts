import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoComponent } from './video.component';
import { By } from '@angular/platform-browser';
import { SimpleChange } from '@angular/core';

describe('VideoComponent', (): void => {
  let component: VideoComponent;
  let fixture: ComponentFixture<VideoComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [VideoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', (): void => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', (): void => {
    it('should set video source when component initializes', (): void => {
      const mockStream = new MediaStream();
      component.srcObject = mockStream;
      fixture.detectChanges();

      const videoElement = fixture.debugElement.query(By.css('video')).nativeElement;
      component.ngAfterViewInit();
      expect(videoElement.srcObject).toBe(mockStream);
    });
  });

  describe('ngOnChanges', (): void => {
    it('should update video source when srcObject changes', (): void => {
      const mockStream1 = new MediaStream();
      const mockStream2 = new MediaStream();

      component.srcObject = mockStream1;
      fixture.detectChanges();

      const videoElement = fixture.debugElement.query(By.css('video')).nativeElement;
      expect(videoElement.srcObject).toBe(mockStream1);

      component.ngOnChanges({
        srcObject: new SimpleChange(mockStream1, mockStream2, false),
      });

      expect(videoElement.srcObject).toEqual(mockStream2);
    });
  });

  describe('updateVideoSource', (): void => {
    it('should set video element source if srcObject is provided', (): void => {
      const mockStream = new MediaStream();
      component.srcObject = mockStream;

      fixture.detectChanges();
      const videoElement = fixture.debugElement.query(By.css('video')).nativeElement;

      component.ngAfterViewInit();

      expect(videoElement.srcObject).toBe(mockStream);
    });

    it('should log an error if video element or srcObject is not found', (): void => {
      const consoleErrorSpy = spyOn(console, 'error');
      component.srcObject = null;

      fixture.detectChanges();
      component.ngAfterViewInit();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Video element or source object not found');
    });
  });
});
