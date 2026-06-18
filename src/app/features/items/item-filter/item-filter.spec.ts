import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ItemFilter } from './item-filter';

describe('ItemFilter', () => {
  let fixture: ComponentFixture<ItemFilter>;
  let component: ItemFilter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemFilter);
    component = fixture.componentInstance;
  });

  it('emits filterChange with categoryId on onCategoryChange', () => {
    const spy = vi.fn();
    component.filterChange.subscribe(spy);

    component.onCategoryChange('cat-1');

    expect(component.filterCategoryId()).toBe('cat-1');
    expect(spy).toHaveBeenCalledWith({ categoryId: 'cat-1' });
  });

  it('parses a numeric string and emits year on onYearChange', () => {
    const spy = vi.fn();
    component.filterChange.subscribe(spy);

    component.onYearChange('2024');

    expect(component.filterYear()).toBe(2024);
    expect(spy).toHaveBeenCalledWith({ year: 2024 });
  });

  it('sets year to null and omits it from filter on empty string', () => {
    const spy = vi.fn();
    component.filterChange.subscribe(spy);

    component.onYearChange('');

    expect(component.filterYear()).toBeNull();
    expect(spy).toHaveBeenCalledWith({});
  });

  it('resets all filters and emits on clearFilters', () => {
    vi.useFakeTimers();
    component.filterName.set('test');
    component.filterCategoryId.set('cat-1');
    component.filterYear.set(2024);
    const spy = vi.fn();
    component.filterChange.subscribe(spy);

    component.clearFilters();

    vi.advanceTimersByTime(300);
    expect(component.filterName()).toBe('');
    expect(component.filterCategoryId()).toBe('');
    expect(component.filterYear()).toBeNull();
    expect(spy).toHaveBeenCalledWith({});
    vi.useRealTimers();
  });

  it('debounces name changes and emits filter after 300ms', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    component.filterChange.subscribe(spy);

    component.onNameChange('test');
    expect(component.filterName()).toBe('');

    vi.advanceTimersByTime(300);
    expect(component.filterName()).toBe('test');
    expect(spy).toHaveBeenCalledWith({ name: 'test' });

    vi.useRealTimers();
  });

  it('omits empty/undefined values from emitted filter', () => {
    const spy = vi.fn();
    component.filterChange.subscribe(spy);

    component.onCategoryChange('');
    expect(spy).toHaveBeenCalledWith({});
  });
});
