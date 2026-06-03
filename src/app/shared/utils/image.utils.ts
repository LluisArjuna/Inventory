export const getOptimizedImageUrl = (url: string | null | undefined): string =>
  url?.includes('/upload/') ? url.replace('/upload/', '/upload/f_auto,q_auto/') : url ?? '';
