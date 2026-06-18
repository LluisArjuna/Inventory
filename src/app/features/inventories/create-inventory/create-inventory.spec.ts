import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CreateInventory } from './create-inventory';
import { AuthService } from '@core/services/auth.service';
import { InventoriesService } from '../services/inventories.service';
import { ToastService } from '@shared/services/toast.service';
import { signal } from '@angular/core';

describe('CreateInventory', () => {
  let component: CreateInventory;
  let fixture: ComponentFixture<CreateInventory>;
  let inventoriesService: { create: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof signal> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let toast: { error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    inventoriesService = { create: vi.fn() };
    auth = { currentUser: signal({ id: 'u1', email: 'a@b.com' }) };
    router = { navigate: vi.fn() };
    toast = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CreateInventory],
      providers: [
        { provide: InventoriesService, useValue: inventoriesService },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateInventory);
    component = fixture.componentInstance;
  });

  it('calls service and navigates on successful create', () => {
    inventoriesService.create.mockReturnValue(of({ id: 'inv-1', name: 'New', isPublic: false, userId: 'u1' }));
    const onCloseSpy = vi.fn();
    component.onClose.subscribe(onCloseSpy);

    component.name.set('My Inventory');
    component.create();

    expect(inventoriesService.create).toHaveBeenCalledWith({
      name: 'My Inventory',
      description: undefined,
      isPublic: false,
      firebaseUid: 'u1',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/inventories', 'inv-1', 'edit']);
    expect(onCloseSpy).toHaveBeenCalled();
  });

  it('does not create when name is empty', () => {
    component.name.set('');
    component.create();
    expect(inventoriesService.create).not.toHaveBeenCalled();
  });

  it('handles create error', () => {
    inventoriesService.create.mockReturnValue(throwError(() => new Error('fail')));
    component.name.set('Test');
    component.create();

    expect(component.creating()).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to create inventory');
  });
});
