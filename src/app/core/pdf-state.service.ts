import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PdfStateService {
  sourceSignal: WritableSignal<Blob | null> = signal(null);
  currentPageSignal: WritableSignal<number> = signal(1);
  totalPagesSignal: WritableSignal<number> = signal(0);
  zoomLevelSignal: WritableSignal<number> = signal(100);
  isLoadedSignal: WritableSignal<boolean> = signal(false);

  loadPDF(blob: Blob): void {
    this.sourceSignal.set(blob);
    this.isLoadedSignal.set(true);
  }

  setCurrentPage(page: number): void {
    this.currentPageSignal.set(page);
  }

  setTotalPages(total: number): void {
    this.totalPagesSignal.set(total);
  }

  setZoomLevel(zoom: number): void {
    this.zoomLevelSignal.set(zoom);
  }
}
