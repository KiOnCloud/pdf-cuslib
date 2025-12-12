import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerComponent } from '../../components/pdf-viewer/pdf-viewer.component';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PdfStateService } from '../../core/pdf-state.service';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule, PdfViewerComponent, ToolbarComponent, SidebarComponent],
  template: `
    <div class="viewer-container">
      <div class="file-upload">
        <input #fileInput type="file" accept=".pdf" hidden (change)="onFileSelected($event)" />
        <button (click)="fileInput.click()">Open PDF File</button>
      </div>

      <app-toolbar />

      <div class="viewer-content">
        <app-sidebar />
        <app-pdf-viewer
          [pdfSource]="pdfSource()"
          (pagesLoaded)="onPagesLoaded($event)" />
      </div>
    </div>
  `,
  styles: [`
    .viewer-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .file-upload {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 100;
    }
    .file-upload button {
      padding: 0.5rem 1rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .viewer-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
  `]
})
export class ViewerComponent {
  private stateService = inject(PdfStateService);

  pdfSource = this.stateService.sourceSignal;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file?.type === 'application/pdf') {
      this.stateService.loadPDF(file);
    } else {
      alert('Please select a valid PDF file');
    }
  }

  onPagesLoaded(total: number) {
    this.stateService.setTotalPages(total);
  }
}
