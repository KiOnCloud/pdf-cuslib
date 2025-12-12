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
        [textLayer]="true"
        [handTool]="false"
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
