import { Injectable, inject } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { PdfStateService } from './pdf-state.service';

@Injectable({ providedIn: 'root' })
export class PdfViewerService {
  private pdfService = inject(NgxExtendedPdfViewerService);
  private stateService = inject(PdfStateService);

  navigateToPage(pageNumber: number): void {
    this.pdfService.scrollPageIntoView(pageNumber);
    this.stateService.setCurrentPage(pageNumber);
  }

  zoomIn(): void {
    const current = this.stateService.zoomLevelSignal();
    this.stateService.setZoomLevel(Math.min(current + 25, 300));
  }

  zoomOut(): void {
    const current = this.stateService.zoomLevelSignal();
    this.stateService.setZoomLevel(Math.max(current - 25, 50));
  }

  async generateThumbnail(pageNumber: number): Promise<string> {
    try {
      const imageUrl = await this.pdfService.getPageAsImage(pageNumber, { scale: 0.5 });
      return imageUrl || '';
    } catch (error) {
      console.error(`Thumbnail generation failed for page ${pageNumber}`, error);
      return '';
    }
  }

  async print(): Promise<void> {
    this.pdfService.print();
  }

  async downloadPDF(filename: string): Promise<void> {
    const blob = await this.pdfService.getCurrentDocumentAsBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  toggleHighlightMode(enabled: boolean): void {
    if (enabled) {
      // Switch to highlight editor mode (mode 9 is highlight in PDF.js)
      this.pdfService.switchAnnotationEdtorMode(9);
    } else {
      // Switch to no editor mode (mode 0)
      this.pdfService.switchAnnotationEdtorMode(0);
    }
  }

  setHighlightColor(color: string): void {
    // Use the editorHighlightColor property from ngx-extended-pdf-viewer
    (this.pdfService as any).editorHighlightColor = color;
  }

  async addHighlight(params: any): Promise<void> {
    // Highlight functionality - to be implemented based on specific requirements
    console.log('Highlight feature to be implemented', params);
  }

  getSerializedAnnotations() {
    const serialized = this.pdfService.getSerializedAnnotations();
    console.log('Serialized Annotations:', serialized);
    return serialized;
  }
}
