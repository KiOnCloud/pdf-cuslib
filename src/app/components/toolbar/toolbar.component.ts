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

      <!-- Hand Tool / Select Mode -->
      <div class="toolbar-group">
        <button
          (click)="toggleHandTool()"
          [class.active]="handToolMode()"
          [disabled]="!isLoaded()">
          {{ handToolMode() ? 'Hand Tool' : 'Select Mode' }}
        </button>
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

      <!-- Text Box Annotations -->
      <div class="toolbar-group">
        <button
          (click)="toggleTextBox()"
          [class.active]="textBoxMode()"
          [disabled]="!isLoaded()">
          Text Box
        </button>
        @if (textBoxMode()) {
          <label>Size:</label>
          <select
            [value]="textBoxFontSize"
            (change)="selectFontSize($event)"
            title="Font Size">
            <option value="10">10pt</option>
            <option value="12">12pt</option>
            <option value="14">14pt</option>
            <option value="16">16pt</option>
            <option value="18">18pt</option>
            <option value="20">20pt</option>
            <option value="24">24pt</option>
            <option value="28">28pt</option>
            <option value="32">32pt</option>
          </select>
          <label>Color:</label>
          <button
            class="color-swatch"
            [class.active]="textBoxFontColor === '#000000'"
            [style.background-color]="'#000000'"
            (click)="selectFontColor('#000000')"
            title="Black">
          </button>
          <button
            class="color-swatch"
            [class.active]="textBoxFontColor === '#FF0000'"
            [style.background-color]="'#FF0000'"
            (click)="selectFontColor('#FF0000')"
            title="Red">
          </button>
          <button
            class="color-swatch"
            [class.active]="textBoxFontColor === '#0000FF'"
            [style.background-color]="'#0000FF'"
            (click)="selectFontColor('#0000FF')"
            title="Blue">
          </button>
          <button
            class="color-swatch"
            [class.active]="textBoxFontColor === '#008000'"
            [style.background-color]="'#008000'"
            (click)="selectFontColor('#008000')"
            title="Green">
          </button>
          <button
            class="color-swatch"
            [class.active]="textBoxFontColor === '#FFA500'"
            [style.background-color]="'#FFA500'"
            (click)="selectFontColor('#FFA500')"
            title="Orange">
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
  handToolMode = this.stateService.handToolModeSignal;
  highlightMode = signal(false);
  pageInput = 1;

  // Highlight settings
  highlightColor = '#FFFF98'; // Default yellow
  highlightOpacity = 0.5; // Default 50%

  // Text box mode state
  textBoxMode = signal(false);

  // Text box settings
  textBoxFontColor = '#000000'; // Default black
  textBoxFontSize = 16; // Default 16pt

  zoomIn() { this.viewerService.zoomIn(); }
  zoomOut() { this.viewerService.zoomOut(); }

  toggleHandTool() { this.viewerService.toggleHandToolMode(); }

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
    const wasActive = this.highlightMode();
    if (!wasActive) {
      // Deactivate all other modes before activating highlight
      this.deactivateAllModes();
      this.highlightMode.set(true);
      this.viewerService.toggleHighlightMode(true);
      this.viewerService.setHighlightColor(this.highlightColor);
    } else {
      // Deactivate highlight mode
      this.highlightMode.set(false);
      this.viewerService.toggleHighlightMode(false);
    }
  }

  selectColor(color: string) {
    this.highlightColor = color;
    this.viewerService.setHighlightColor(color);
  }

  // Helper method to deactivate all annotation modes
  private deactivateAllModes() {
    this.highlightMode.set(false);
    this.textBoxMode.set(false);
    // Add more modes here as they are implemented
  }

  toggleTextBox() {
    const wasActive = this.textBoxMode();
    if (!wasActive) {
      // Deactivate all other modes before activating text box
      this.deactivateAllModes();
      this.textBoxMode.set(true);
      this.viewerService.toggleTextBoxMode(true);
      this.viewerService.setTextBoxFontColor(this.textBoxFontColor);
      this.viewerService.setTextBoxFontSize(this.textBoxFontSize);
    } else {
      // Deactivate text box mode
      this.textBoxMode.set(false);
      this.viewerService.toggleTextBoxMode(false);
    }
  }

  selectFontColor(color: string) {
    this.textBoxFontColor = color;
    this.viewerService.setTextBoxFontColor(color);
  }

  selectFontSize(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.textBoxFontSize = Number(select.value);
    this.viewerService.setTextBoxFontSize(this.textBoxFontSize);
  }
}
