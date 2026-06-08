import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MyInventories } from './my-inventories';
import { AuthService } from '@core/services/auth.service';
import { InventoriesService } from '../services/inventories.service';
import { signal } from '@angular/core';

describe('MyInventories', () => {
  let fixture: ComponentFixture<MyInventories>;
  let component: MyInventories;
  let inventoriesService: { getByUserId: ReturnType<typeof vi.fn>; toggleVisibility: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof signal> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const mockPage = {
    content: [
      { id: 'inv-1', name: 'One', isPublic: true, userId: 'u1' },
      { id: 'inv-2', name: 'Two', isPublic: false, userId: 'u1' },
    ],
    totalPages: 1,
    totalElements: 2,
    number: 0,
    size: 20,
  };

  beforeEach(async () => {
    inventoriesService = { getByUserId: vi.fn(), toggleVisibility: vi.fn(), delete: vi.fn() };
    auth = { currentUser: signal({ id: 'u1', email: 'a@b.com' }) };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MyInventories],
      providers: [
        { provide: InventoriesService, useValue: inventoriesService },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyInventories);
    component = fixture.componentInstance;
  });

  it('loads inventories for current user on init', () => {
    inventoriesService.getByUserId.mockReturnValue(of(mockPage));
    fixture.detectChanges();

    expect(inventoriesService.getByUserId).toHaveBeenCalledWith('u1', 0);
    expect(component.inventories()).toEqual(mockPage.content);
  });

  it('does nothing when no user is authenticated', () => {
    auth.currentUser = signal(null);
    inventoriesService.getByUserId.mockReturnValue(of(mockPage));
    fixture.detectChanges();

    expect(inventoriesService.getByUserId).not.toHaveBeenCalled();
  });

  it('toggles visibility and updates the list', () => {
    component.inventories.set(mockPage.content as any);
    inventoriesService.toggleVisibility.mockReturnValue(of({}));

    component.onToggleVisibility('inv-2');
    expect(inventoriesService.toggleVisibility).toHaveBeenCalledWith('inv-2', true);
    expect(component.inventories()[1].isPublic).toBe(true);
  });

  it('deletes inventory and removes it from the list', () => {
    component.inventories.set(mockPage.content as any);
    inventoriesService.delete.mockReturnValue(of(undefined));

    component.onDelete('inv-1');
    expect(component.showDeleteConfirm()).toBe(true);
    expect(component.pendingDeleteId()).toBe('inv-1');

    component.confirmDelete();
    expect(inventoriesService.delete).toHaveBeenCalledWith('inv-1');
    expect(component.inventories().map(i => i.id)).toEqual(['inv-2']);
  });

  it('handles delete error gracefully', () => {
    component.inventories.set(mockPage.content as any);
    inventoriesService.delete.mockReturnValue(throwError(() => new Error('fail')));

    component.onDelete('inv-1');
    component.confirmDelete();
    expect(component.inventories()).toHaveLength(2);
  });
});
