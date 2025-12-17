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
        <button (click)="onExportAnnotations()" [disabled]="!isLoaded()">Export</button>
        <button (click)="fileInput.click()" [disabled]="!isLoaded()">Import</button>
        <input #fileInput type="file" accept=".json" hidden (change)="onImportAnnotations($event)" />
      </div>

      <!-- Annotations -->
      <div class="toolbar-group">
        <button
          (click)="toggleHighlight()"
          [class.active]="highlightMode()"
          [disabled]="!isLoaded()">
          Highlight
        </button>
        @if (highlightMode()) {
          <label>Color:</label>
          <button
            class="color-swatch"
            [class.active]="highlightColor === '#FFFF98'"
            [style.background-color]="'#FFFF98'"
            (click)="selectColor('#FFFF98')"
            title="Yellow">
          </button>
          <button
            class="color-swatch"
            [class.active]="highlightColor === '#53FFBC'"
            [style.background-color]="'#53FFBC'"
            (click)="selectColor('#53FFBC')"
            title="Green">
          </button>
          <button
            class="color-swatch"
            [class.active]="highlightColor === '#80EBFF'"
            [style.background-color]="'#80EBFF'"
            (click)="selectColor('#80EBFF')"
            title="Cyan">
          </button>
          <button
            class="color-swatch"
            [class.active]="highlightColor === '#FFCBE6'"
            [style.background-color]="'#FFCBE6'"
            (click)="selectColor('#FFCBE6')"
            title="Pink">
          </button>
          <button
            class="color-swatch"
            [class.active]="highlightColor === '#FF4F5F'"
            [style.background-color]="'#FF4F5F'"
            (click)="selectColor('#FF4F5F')"
            title="Red">
          </button>
        }
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
    button.color-swatch {
      width: 30px;
      height: 30px;
      padding: 0;
      border: 2px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    button.color-swatch:hover {
      transform: scale(1.1);
      border-color: #666;
    }
    button.color-swatch.active {
      border: 3px solid #007bff;
      transform: scale(1.15);
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    }
    input[type="number"] { width: 60px; padding: 0.5rem; }
    input[type="range"] {
      width: 100px;
      cursor: pointer;
    }
    select {
      padding: 0.4rem 0.6rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 0.9rem;
    }
    label {
      font-size: 0.9rem;
      color: #555;
      margin-left: 0.5rem;
    }
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

  // Highlight settings
  highlightColor = '#FFFF98'; // Default yellow
  highlightOpacity = 0.5; // Default 50%

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
  onExportAnnotations() { this.viewerService.getSerializedAnnotations(); }

  async onImportAnnotations(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON file');
      input.value = ''; // Reset input
      return;
    }

    try {
    //   this.viewerService.clearAllAnnotations();
      await this.viewerService.importAnnotations(file);
    } catch (error) {
      console.error('Import error:', error);

    } finally {
      // Reset input to allow importing the same file again
      input.value = '';
    }
  }

  toggleHighlight() {
    this.highlightMode.update(v => !v);
    if (this.highlightMode()) {
      this.viewerService.toggleHighlightMode(true);
      this.viewerService.setHighlightColor(this.highlightColor);
    } else {
      this.viewerService.toggleHighlightMode(false);
    }
  }

  selectColor(color: string) {
    this.highlightColor = color;
    this.viewerService.setHighlightColor(color);
  }
}
