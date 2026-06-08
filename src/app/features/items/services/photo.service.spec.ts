import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PhotoService } from './photo.service';
import { ApiService } from '@core/services/api.service';
import { API_ROUTES } from '@core/constants/api-routes';

describe('PhotoService', () => {
  let service: PhotoService;
  let api: { upload: ReturnType<typeof vi.fn> };
  const mockPhoto = { id: 'p1', itemId: 'item-1', url: 'a.jpg', position: 0 };

  let appendSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    api = { upload: vi.fn() };
    appendSpy = vi.spyOn(FormData.prototype, 'append');
    appendSpy.mockClear();

    TestBed.configureTestingModule({
      providers: [
        PhotoService,
        { provide: ApiService, useValue: api },
      ],
    });

    service = TestBed.inject(PhotoService);
  });

  describe('upload', () => {
    const mockFile = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });

    beforeEach(() => {
      appendSpy.mockClear();
    });

    it('builds FormData with file, itemId, position, and format', () => {
      api.upload.mockReturnValue(of(mockPhoto));

      service.upload('item-1', mockFile, 0);

      expect(appendSpy).toHaveBeenCalledWith('file', mockFile);
      expect(appendSpy).toHaveBeenCalledWith('itemId', 'item-1');
      expect(appendSpy).toHaveBeenCalledWith('position', '0');
      expect(appendSpy).toHaveBeenCalledWith('format', 'webp');
      expect(api.upload).toHaveBeenCalledWith(API_ROUTES.PHOTOS, expect.any(FormData));
    });

    it('includes altText when provided', () => {
      api.upload.mockReturnValue(of(mockPhoto));

      service.upload('item-1', mockFile, 1, 'A photo');

      expect(appendSpy).toHaveBeenCalledWith('altText', 'A photo');
    });

    it('omits altText when not provided', () => {
      api.upload.mockReturnValue(of(mockPhoto));

      service.upload('item-1', mockFile, 0);

      expect(appendSpy).not.toHaveBeenCalledWith('altText', expect.anything());
    });
  });
});
