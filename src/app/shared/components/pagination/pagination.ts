import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly onPageChange = output<number>();

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i)
  );
}
