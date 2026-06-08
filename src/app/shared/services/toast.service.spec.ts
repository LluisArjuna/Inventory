import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a success toast', () => {
    service.success('Saved');
    const toasts = service.toasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Saved');
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].id).toBe(1);
  });

  it('adds an error toast', () => {
    service.error('Failed');
    const toasts = service.toasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Failed');
    expect(toasts[0].type).toBe('error');
  });

  it('increments id for each toast', () => {
    service.success('A');
    service.success('B');
    const toasts = service.toasts();
    expect(toasts[0].id).toBe(1);
    expect(toasts[1].id).toBe(2);
  });

  it('removes a toast by id', () => {
    service.success('A');
    service.success('B');
    service.remove(1);
    const toasts = service.toasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].id).toBe(2);
  });

  it('remove is a no-op for non-existent id', () => {
    service.success('A');
    service.remove(99);
    expect(service.toasts()).toHaveLength(1);
  });

  it('auto-removes toast after 5 seconds', () => {
    vi.useFakeTimers();
    service.success('Auto-remove');
    expect(service.toasts()).toHaveLength(1);
    vi.advanceTimersByTime(5000);
    expect(service.toasts()).toHaveLength(0);
  });

  it('clearTimeout when remove is called before expiry', () => {
    vi.useFakeTimers();
    service.success('Manual remove');
    service.remove(1);
    vi.advanceTimersByTime(5000);
    expect(service.toasts()).toHaveLength(0);
  });
});
