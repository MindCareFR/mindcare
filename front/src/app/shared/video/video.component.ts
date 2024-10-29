import { Component, Input, AfterViewInit, ViewChild, ElementRef, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [],
  templateUrl: './video.component.html',
})
export class VideoComponent implements AfterViewInit, OnChanges {
  @Input() srcObject: MediaStream | null = null;
  @Input() controls = false;
  @ViewChild('video', { static: true }) videoElementRef!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    this.updateVideoSource();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['srcObject']) {
      this.updateVideoSource();
    }
  }

  private updateVideoSource() {
    const videoElement = this.videoElementRef?.nativeElement;
    if (videoElement && this.srcObject) {
      videoElement.srcObject = this.srcObject;
      console.log('Video element source set:', this.srcObject);
    } else {
      console.error('Video element or source object not found');
    }
  }
}