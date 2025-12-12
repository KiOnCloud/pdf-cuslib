import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfViewerService } from '../../core/pdf-viewer.service';
import { PdfStateService } from '../../core/pdf-state.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="toolbar">
      <!-- Zoom Controls -->
      <div class="toolbar-group">
        <button (click)="zoomOut()" [disabled]="!isLoaded()">-</button>
        <span>{{ zoomLevel() }}%</span>
        <button (click)="zoomIn()" [disabled]="!isLoaded()">+</button>
      </div>

      <!-- Page Navigation -->
      <div class="toolbar-group">
        <button (click)="previousPage()" [disabled]="!isLoaded()">Previous</button>
        <input type="number"
          [(ngModel)]="pageInput"
          (keyup.enter)="goToPage()"
          [disabled]="!isLoaded()"
          min="1"
          [max]="totalPages()" />
        <span>/ {{ totalPages() }}</span>
        <button (click)="nextPage()" [disabled]="!isLoaded()">Next</button>
      </div>

      <!-- Actions -->
      <div class="toolbar-group">
        <button (click)="onPrint()" [disabled]="!isLoaded()">Print</button>
        <button (click)="onDownload()" [disabled]="!isLoaded()">Download</button>
      </div>

      <!-- Annotations -->
      <div class="toolbar-group">
        <button
          (click)="toggleHighlight()"
          [class.active]="highlightMode()"
          [disabled]="!isLoaded()">
          Highlight
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toolbar {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      flex-wrap: wrap;
    }
    .toolbar-group { display: flex; gap: 0.5rem; align-items: center; }
    button { padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button.active { background: #007bff; color: white; }
    input { width: 60px; padding: 0.5rem; }
  `]
})
export class ToolbarComponent {
  private viewerService = inject(PdfViewerService);
  private stateService = inject(PdfStateService);

  isLoaded = this.stateService.isLoadedSignal;
  currentPage = this.stateService.currentPageSignal;
  totalPages = this.stateService.totalPagesSignal;
  zoomLevel = this.stateService.zoomLevelSignal;
  highlightMode = signal(false);
  pageInput = 1;

  zoomIn() { this.viewerService.zoomIn(); }
  zoomOut() { this.viewerService.zoomOut(); }

  previousPage() {
    const newPage = Math.max(1, this.currentPage() - 1);
    this.viewerService.navigateToPage(newPage);
  }

  nextPage() {
    const newPage = Math.min(this.totalPages(), this.currentPage() + 1);
    this.viewerService.navigateToPage(newPage);
  }

  goToPage() {
    if (this.pageInput >= 1 && this.pageInput <= this.totalPages()) {
      this.viewerService.navigateToPage(this.pageInput);
    }
  }

  onPrint() { this.viewerService.print(); }
  onDownload() { this.viewerService.downloadPDF('document.pdf'); }
  toggleHighlight() { this.highlightMode.update(v => !v); }
}
