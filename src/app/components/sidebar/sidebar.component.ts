import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerService } from '../../core/pdf-viewer.service';
import { PdfStateService } from '../../core/pdf-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private viewerService = inject(PdfViewerService);
  private stateService = inject(PdfStateService);

  currentPage = this.stateService.currentPageSignal;
  totalPages = this.stateService.totalPagesSignal;
  thumbnails = signal<Record<number, string>>({});

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  constructor() {
    effect(() => {
      const total = this.totalPages();
      if (total > 0) this.generateThumbnails();
    });
  }

  async generateThumbnails() {
    for (let page = 1; page <= Math.min(this.totalPages(), 10); page++) {
      if (!this.thumbnails()[page]) {
        const imageUrl = await this.viewerService.generateThumbnail(page);
        this.thumbnails.update(t => ({ ...t, [page]: imageUrl }));
      }
    }
  }

  selectPage(page: number) {
    this.viewerService.navigateToPage(page);
  }
}
