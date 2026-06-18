import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('get', () => {
    it('sends GET with path and params', () => {
      service.get<{ id: string }>('/items', { page: 0, size: 20 }).subscribe();
      const req = httpMock.expectOne(r =>
        r.url === 'http://localhost:8080/api/items'
        && r.params.get('page') === '0'
        && r.params.get('size') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ id: '1' });
    });

    it('omits undefined params', () => {
      service.get('/items', { name: undefined, page: 0 }).subscribe();
      const req = httpMock.expectOne(r =>
        r.params.has('page') && !r.params.has('name')
      );
      req.flush([]);
    });
  });

  describe('getById', () => {
    it('sends GET with id in path', () => {
      service.getById('/items', 'abc-123').subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/items/abc-123');
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('create', () => {
    it('sends POST with body', () => {
      const body = { name: 'New', isPublic: true };
      service.create('/inventories', body).subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/inventories');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({});
    });
  });

  describe('update', () => {
    it('sends PUT with id and body', () => {
      const body = { name: 'Updated' };
      service.update('/inventories', 'abc', body).subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/inventories/abc');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush({});
    });
  });

  describe('put', () => {
    it('sends PUT to path without id', () => {
      const body = { availabilities: [] };
      service.put('/inventories/abc/availabilities', body).subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/inventories/abc/availabilities');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush([]);
    });
  });

  describe('delete', () => {
    it('sends DELETE with id', () => {
      service.delete('/items', 'item-1').subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/items/item-1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('upload', () => {
    it('sends POST with FormData', () => {
      const fd = new FormData();
      fd.append('file', new Blob(['test']));
      service.upload('/photos', fd).subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/photos');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(fd);
      req.flush({});
    });
  });
});
