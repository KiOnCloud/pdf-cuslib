import { Component, input, output, ViewChild } from '@angular/core';
import { NgxExtendedPdfViewerModule, NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [NgxExtendedPdfViewerModule],
  template: `
    @if (pdfSource()) {
      <ngx-extended-pdf-viewer
        #pdfViewer
        [src]="pdfSource()!"
        [showToolbar]="false"
        (pagesLoaded)="onPagesLoaded($event)"
        (pageRendered)="onPageRendered($event)"
      />
    }
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `]
})
export class PdfViewerComponent {
  pdfSource = input.required<Blob | null>();
  pagesLoaded = output<number>();
  pageRendered = output<number>();

  @ViewChild('pdfViewer') pdfViewerRef!: NgxExtendedPdfViewerComponent;

  onPagesLoaded(event: any): void {
    this.pagesLoaded.emit(event.pagesCount);
  }

  onPageRendered(event: any): void {
    this.pageRendered.emit(event.pageNumber);
  }
}
