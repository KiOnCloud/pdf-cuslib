import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerService } from '../../core/pdf-viewer.service';
import { PdfStateService } from '../../core/pdf-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar">
      <h3>Thumbnails</h3>
      <div class="thumbnails-container">
        @for (page of pages(); track page) {
          <div class="thumbnail"
            [class.active]="currentPage() === page"
            (click)="selectPage(page)">
            @if (thumbnails()[page]) {
              <img [src]="thumbnails()[page]" [alt]="'Page ' + page" />
            } @else {
              <div class="placeholder">{{ page }}</div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 150px;
      border-right: 1px solid #ddd;
      overflow-y: auto;
      padding: 1rem;
    }
    h3 { margin: 0 0 1rem 0; font-size: 0.9rem; }
    .thumbnails-container { display: flex; flex-direction: column; gap: 0.5rem; }
    .thumbnail {
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 4px;
      overflow: hidden;
    }
    .thumbnail:hover { border-color: #ddd; }
    .thumbnail.active { border-color: #007bff; }
    .thumbnail img { width: 100%; display: block; }
    .placeholder {
      aspect-ratio: 8.5 / 11;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
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
