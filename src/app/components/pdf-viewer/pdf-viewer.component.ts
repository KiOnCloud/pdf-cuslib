import { Component, input, output, ViewChild, inject } from '@angular/core';
import { NgxExtendedPdfViewerModule, NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer';
import { PdfStateService } from '../../core/pdf-state.service';

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
        [textLayer]="true"
        [handTool]="handToolMode()"
        [showHandToolButton]="false"
        [enableDragAndDrop]="false"
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
    .pdf-container {
      height: 100%;
      width: 100%;
      position: relative;
    }
    .mode-toggle-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .mode-toggle-btn:hover {
      background-color: #0056b3;
    }
    :host ::ng-deep .textLayer {
      cursor: text !important;
    }
    :host ::ng-deep .page {
      cursor: text !important;
    }
    :host ::ng-deep ngx-extended-pdf-viewer {
      cursor: text !important;
    }
    /* Hide built-in editor toolbar/overlay */
    :host ::ng-deep #editorModeButtons,
    :host ::ng-deep #editorModeSeparator,
    :host ::ng-deep .editorParamsToolbar,
    :host ::ng-deep #editorHighlightParamsToolbar,
    :host ::ng-deep #editorFreeTextParamsToolbar,
    :host ::ng-deep #editorInkParamsToolbar,
    :host ::ng-deep #editorStampParamsToolbar {
      display: none !important;
    }
  `]
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
