import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html'
})
export class Pagination {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageChange = output<number>();

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i)
  );
}
