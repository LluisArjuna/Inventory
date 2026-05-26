import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageService {
  toWebp(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(img.src);
          if (blob) {
            resolve(
              new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.webp'),
                { type: 'image/webp' }
              )
            );
          } else {
            resolve(file);
          }
        }, 'image/webp', quality);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to decode image'));
      };
      img.src = URL.createObjectURL(file);
    });
  }
}
