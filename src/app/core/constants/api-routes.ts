export const API_ROUTES = {
  AUTH: {
    FIREBASE: '/auth/firebase',
  },
  GEOCODE: {
    SEARCH: '/geocode/search',
    REVERSE: '/geocode/reverse',
  },
  INVENTORIES: {
    BASE: '/inventories',
    PUBLIC: '/inventories/public',
    BY_USER: (userId: string) => `/inventories/user/${userId}` as const,
    AVAILABILITIES: (id: string) => `/inventories/${id}/availabilities` as const,
  },
  ITEMS: {
    BASE: '/items',
    PHOTOS: (itemId: string) => `/items/${itemId}/photos` as const,
  },
  CATEGORIES: '/categories',
  COORDINATES: '/coordinates',
  PHOTOS: '/photos',
} as const;
