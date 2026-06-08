import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CreateItem } from './create-item';
import { CategoriesStore } from '@shared/stores/categories.store';
import { CoordinatesService } from '../services/coordinates.service';
import { ItemsService } from '../services/items.service';
import { PhotoService } from '../services/photo.service';
import { MapService } from '@shared/services/map.service';
import { ToastService } from '@shared/services/toast.service';

describe('CreateItem', () => {
  let fixture: ComponentFixture<CreateItem>;
  let component: CreateItem;
  let coordinatesService: { create: ReturnType<typeof vi.fn> };
  let itemsService: { create: ReturnType<typeof vi.fn> };
  let photoService: { upload: ReturnType<typeof vi.fn> };
  let mapService: { createMap: ReturnType<typeof vi.fn>; removeMarker: ReturnType<typeof vi.fn>; addMarker: ReturnType<typeof vi.fn> };

  const mockCoord = { id: 'c1', coordX: 1, coordY: 2 };
  const mockItem = { id: 'item-1', name: 'Test', year: 2025, inventoryId: 'inv-1', categoryId: 'cat-1' };
  const mockCategory = { id: 'cat-1', name: 'Electronics' };
  const mockMarker = { getLatLng: () => ({ lat: 41.5, lng: 2.1 }) };

  beforeEach(async () => {
    coordinatesService = { create: vi.fn() };
    itemsService = { create: vi.fn() };
    photoService = { upload: vi.fn() };
    mapService = {
      createMap: vi.fn().mockReturnValue({ on: vi.fn() }),
      removeMarker: vi.fn(),
      addMarker: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CreateItem],
      providers: [
        { provide: CategoriesStore, useValue: { load: vi.fn(), categories: vi.fn().mockReturnValue([]) } },
        { provide: CoordinatesService, useValue: coordinatesService },
        { provide: ItemsService, useValue: itemsService },
        { provide: PhotoService, useValue: photoService },
        { provide: MapService, useValue: mapService },
        { provide: ToastService, useValue: { error: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inventoryId', 'inv-1');
  });

  describe('canCreate', () => {
    it('returns false when name is empty', () => {
      component.year.set(2025);
      component.selectedCategory.set(mockCategory);
      component.marker.set(mockMarker as any);
      expect(component.canCreate()).toBe(false);
    });

    it('returns false when year is null', () => {
      component.name.set('Test');
      component.selectedCategory.set(mockCategory);
      component.marker.set(mockMarker as any);
      expect(component.canCreate()).toBe(false);
    });

    it('returns false when category is null', () => {
      component.name.set('Test');
      component.year.set(2025);
      component.marker.set(mockMarker as any);
      expect(component.canCreate()).toBe(false);
    });

    it('returns false when marker is null', () => {
      component.name.set('Test');
      component.year.set(2025);
      component.selectedCategory.set(mockCategory);
      expect(component.canCreate()).toBe(false);
    });

    it('returns true when all fields are valid', () => {
      component.name.set('Test');
      component.year.set(2025);
      component.selectedCategory.set(mockCategory);
      component.marker.set(mockMarker as any);
      expect(component.canCreate()).toBe(true);
    });
  });

  describe('create', () => {
    it('calls services in order and emits onCreated + onClose on success', () => {
      coordinatesService.create.mockReturnValue(of(mockCoord));
      itemsService.create.mockReturnValue(of(mockItem));

      component.name.set('Test');
      component.year.set(2025);
      component.selectedCategory.set(mockCategory);
      component.marker.set(mockMarker as any);

      const onCreatedSpy = vi.fn();
      const onCloseSpy = vi.fn();
      component.onCreated.subscribe(onCreatedSpy);
      component.onClose.subscribe(onCloseSpy);

      component.create();

      expect(coordinatesService.create).toHaveBeenCalledWith(41.5, 2.1);
      expect(itemsService.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test',
        year: 2025,
        inventoryId: 'inv-1',
        categoryId: 'cat-1',
        coordinateId: 'c1',
      }));
      expect(onCreatedSpy).toHaveBeenCalled();
      expect(onCloseSpy).toHaveBeenCalled();
      expect(component.creating()).toBe(false);
    });

    it('skips photo upload when no file is selected', () => {
      coordinatesService.create.mockReturnValue(of(mockCoord));
      itemsService.create.mockReturnValue(of(mockItem));

      component.name.set('Test');
      component.year.set(2025);
      component.selectedCategory.set(mockCategory);
      component.marker.set(mockMarker as any);

      component.create();

      expect(photoService.upload).not.toHaveBeenCalled();
    });

    it('sets creating back to false on error', () => {
      coordinatesService.create.mockReturnValue(throwError(() => new Error('fail')));

      component.name.set('Test');
      component.year.set(2025);
      component.selectedCategory.set(mockCategory);
      component.marker.set(mockMarker as any);

      expect(component.creating()).toBe(false);
      component.create();
      expect(component.creating()).toBe(false);
    });

    it('does nothing when canCreate is false', () => {
      component.create();

      expect(coordinatesService.create).not.toHaveBeenCalled();
    });
  });
});
