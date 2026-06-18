import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { PublicInventories } from './public-inventories';
import { InventoriesService } from '../services/inventories.service';
import { signal } from '@angular/core';
import type { Params } from '@angular/router';

describe('PublicInventories', () => {
  let fixture: ComponentFixture<PublicInventories>;
  let component: PublicInventories;
  let inventoriesService: { getPublic: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let queryParams$: Subject<Params>;
  let route: { snapshot: { queryParamMap: { get: ReturnType<typeof vi.fn> } }; queryParams: Subject<Params> };

  const mockPage = {
    content: [
      { id: 'inv-1', name: 'Public One', isPublic: true, userId: 'u1' },
      { id: 'inv-2', name: 'Public Two', isPublic: true, userId: 'u2' },
    ],
    totalPages: 1,
    totalElements: 2,
    number: 0,
    size: 20,
  };

  beforeEach(async () => {
    inventoriesService = { getPublic: vi.fn() };
    router = { navigate: vi.fn() };
    queryParams$ = new Subject<Params>();
    route = {
      snapshot: { queryParamMap: { get: vi.fn() } },
      queryParams: queryParams$,
    };

    await TestBed.configureTestingModule({
      imports: [PublicInventories],
      providers: [
        { provide: InventoriesService, useValue: inventoriesService },
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicInventories);
    component = fixture.componentInstance;
  });

  it('loads public inventories on init with no search filter', () => {
    inventoriesService.getPublic.mockReturnValue(of(mockPage));
    fixture.detectChanges();

    expect(inventoriesService.getPublic).toHaveBeenCalledWith(0, 20, {});
    expect(component.inventories()).toEqual(mockPage.content);
    expect(component.searchQuery()).toBe('');
  });

  it('reads search query from route params on init', () => {
    route.snapshot.queryParamMap.get.mockReturnValue('test');
    inventoriesService.getPublic.mockReturnValue(of({ content: [], totalPages: 0, totalElements: 0, number: 0, size: 20 }));

    fixture.detectChanges();

    expect(component.searchQuery()).toBe('test');
    expect(inventoriesService.getPublic).toHaveBeenCalledWith(0, 20, { name: 'test' });
  });

  it('loads inventories with search filter', () => {
    inventoriesService.getPublic.mockReturnValue(of(mockPage));
    component.searchQuery.set('search-term');
    component.loadInventories();

    expect(inventoriesService.getPublic).toHaveBeenCalledWith(0, 20, { name: 'search-term' });
  });

  it('handles load error', () => {
    inventoriesService.getPublic.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();

    expect(component.error()).toBe('Failed to load inventories');
    expect(component.loading()).toBe(false);
  });
});
