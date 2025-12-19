import { Component, input, output, ViewChild, inject } from '@angular/core';
import { NgxExtendedPdfViewerModule, NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer';
import { PdfStateService } from '../../core/pdf-state.service';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [NgxExtendedPdfViewerModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent {
  private stateService = inject(PdfStateService);

  pdfSource = input.required<Blob | null>();
  pagesLoaded = output<number>();
  pageRendered = output<number>();

  @ViewChild('pdfViewer') pdfViewerRef!: NgxExtendedPdfViewerComponent;

  handToolMode = this.stateService.handToolModeSignal;

  onPagesLoaded(event: any): void {
    this.pagesLoaded.emit(event.pagesCount);
  }

  onPageRendered(event: any): void {
    this.pageRendered.emit(event.pageNumber);
  }

  toggleMode(): void {
    this.stateService.setHandToolMode(!this.handToolMode());
  }
}
