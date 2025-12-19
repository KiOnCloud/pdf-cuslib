import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfViewerService } from '../../core/pdf-viewer.service';
import { PdfStateService } from '../../core/pdf-state.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
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

  onUndo() { this.viewerService.undo(); }

  onRedo() { this.viewerService.redo(); }

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
