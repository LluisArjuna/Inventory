import { TestBed } from '@angular/core/testing';
import { createCrud } from './base-crud.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';

describe('createCrud', () => {
  let api: { [K in keyof ApiService]: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = {
      get: vi.fn().mockReturnValue(of({})),
      getById: vi.fn().mockReturnValue(of({})),
      create: vi.fn().mockReturnValue(of({})),
      update: vi.fn().mockReturnValue(of({})),
      put: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of(undefined)),
      upload: vi.fn().mockReturnValue(of({})),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: api },
      ],
    });
  });

  function createTestCrud() {
    return TestBed.runInInjectionContext(() => createCrud<any>('/test'));
  }

  it('returns an object with all CRUD methods', () => {
    const crud = createTestCrud();
    expect(crud).toHaveProperty('getAll');
    expect(crud).toHaveProperty('getById');
    expect(crud).toHaveProperty('create');
    expect(crud).toHaveProperty('update');
    expect(crud).toHaveProperty('delete');
  });

  describe('getAll', () => {
    it('calls api.get with path, page, size', () => {
      const crud = createTestCrud();
      crud.getAll(1, 10);
      expect(api.get).toHaveBeenCalledWith('/test', { page: 1, size: 10 });
    });

    it('spreads filters into params', () => {
      const crud = createTestCrud();
      crud.getAll(0, 20, { name: 'foo', categoryId: 'c1' });
      expect(api.get).toHaveBeenCalledWith('/test', {
        page: 0, size: 20, name: 'foo', categoryId: 'c1',
      });
    });

    it('uses defaults: page=0, size=20', () => {
      const crud = createTestCrud();
      crud.getAll();
      expect(api.get).toHaveBeenCalledWith('/test', { page: 0, size: 20 });
    });
  });

  describe('getById', () => {
    it('calls api.getById with id', () => {
      const crud = createTestCrud();
      crud.getById('abc');
      expect(api.getById).toHaveBeenCalledWith('/test', 'abc');
    });
  });

  describe('create', () => {
    it('calls api.create with data', () => {
      const crud = createTestCrud();
      const data = { name: 'test' };
      crud.create(data);
      expect(api.create).toHaveBeenCalledWith('/test', data);
    });
  });

  describe('update', () => {
    it('calls api.update with id and data', () => {
      const crud = createTestCrud();
      const data = { name: 'updated' };
      crud.update('abc', data);
      expect(api.update).toHaveBeenCalledWith('/test', 'abc', data);
    });
  });

  describe('delete', () => {
    it('calls api.delete with id', () => {
      const crud = createTestCrud();
      crud.delete('abc');
      expect(api.delete).toHaveBeenCalledWith('/test', 'abc');
    });
  });
});
