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

  getSerializedAnnotations(): void {
    const serialized = this.pdfService.getSerializedAnnotations();

    if (!serialized || serialized.length === 0) {
      console.warn('No annotations to export');
      alert('No annotations found to export');
      return;
    }

    // Remove temporary IDs as recommended by the library
    const annotationsToExport = serialized.map(({ id, ...rest }) => rest);

    // Create JSON blob
    const jsonString = JSON.stringify(annotationsToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pdf-annotations-${timestamp}.json`;

    // Download file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    console.log(`Exported ${annotationsToExport.length} annotation(s) to ${filename}`);
  }

  async importAnnotations(file: File): Promise<void> {
    try {
      // Step 1: Read file content
      const fileContent = await this.readFileAsText(file);

      // Step 2: Parse JSON
      let annotations: any[];
      try {
        const parsed = JSON.parse(fileContent);
        annotations = Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        throw new Error('Invalid JSON format. Please select a valid annotation file.');
      }

      // Step 3: Validate annotations
      const validAnnotations = this.validateAnnotations(annotations);

      if (validAnnotations.length === 0) {
        throw new Error('No valid annotations found in the file.');
      }

      // Step 4: Load annotations into PDF viewer
      for (const annotation of validAnnotations) {
        await this.pdfService.addEditorAnnotation(annotation);
      }

      console.log(`Successfully imported ${validAnnotations.length} annotation(s)`);

    } catch (error) {
      console.error('Import annotations failed:', error);
      throw error;
    }
  }

  clearAllAnnotations(): void {
    this.pdfService.removeEditorAnnotations();
    console.log('All annotations cleared');
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private validateAnnotations(annotations: any[]): any[] {
    const validTypes = [3, 9, 13, 15, 16]; // FreeText, Highlight, Stamp, Ink, Popup

    return annotations.filter((annotation, index) => {
      // Required fields validation
      if (typeof annotation.annotationType !== 'number') {
        console.warn(`Annotation ${index}: missing or invalid annotationType`);
        return false;
      }

      if (!validTypes.includes(annotation.annotationType)) {
        console.warn(`Annotation ${index}: unsupported type ${annotation.annotationType}`);
        return false;
      }

      if (typeof annotation.pageIndex !== 'number' || annotation.pageIndex < 0) {
        console.warn(`Annotation ${index}: missing or invalid pageIndex`);
        return false;
      }

      if (!Array.isArray(annotation.rect) || annotation.rect.length !== 4) {
        console.warn(`Annotation ${index}: missing or invalid rect array`);
        return false;
      }

      // Type-specific validation
      if (annotation.annotationType === 9) { // Highlight
        if (!Array.isArray(annotation.color) || annotation.color.length !== 3) {
          console.warn(`Annotation ${index}: highlight missing valid color array`);
          return false;
        }
        if (typeof annotation.opacity !== 'number' || annotation.opacity < 0 || annotation.opacity > 1) {
          console.warn(`Annotation ${index}: highlight missing valid opacity`);
          return false;
        }
      }

      return true;
    });
  }
}
