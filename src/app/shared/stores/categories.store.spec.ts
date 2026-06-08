import { TestBed } from '@angular/core/testing';
import { CategoriesStore } from './categories.store';
import { CategoriesService } from '@features/items/services/categories.service';
import { of } from 'rxjs';

describe('CategoriesStore', () => {
  let store: CategoriesStore;
  let service: { getAll: ReturnType<typeof vi.fn> };

  const mockPage = {
    content: [
      { id: 'c1', name: 'Electronics' },
      { id: 'c2', name: 'Books' },
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 100,
  };

  beforeEach(() => {
    service = { getAll: vi.fn().mockReturnValue(of(mockPage)) };
    TestBed.configureTestingModule({
      providers: [
        CategoriesStore,
        { provide: CategoriesService, useValue: service },
      ],
    });
    store = TestBed.inject(CategoriesStore);
  });

  it('loads categories on first call', () => {
    store.load();
    expect(service.getAll).toHaveBeenCalledTimes(1);
    expect(store.categories()).toEqual(mockPage.content);
  });

  it('is idempotent on repeated calls', () => {
    store.load();
    store.load();
    store.load();
    expect(service.getAll).toHaveBeenCalledTimes(1);
  });

  it('exposes a categoryMap computed from id to name', () => {
    store.load();
    const map = store.categoryMap();
    expect(map.get('c1')).toBe('Electronics');
    expect(map.get('c2')).toBe('Books');
    expect(map.size).toBe(2);
  });
});
