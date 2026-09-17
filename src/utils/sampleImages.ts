import { ImageItem } from '../types';

export const SAMPLE_IMAGES: Array<Omit<ImageItem, 'id'> & { id?: string }> = [
  {
    name: 'mountain-landscape-sunrise.jpg',
    size: 245000,
    type: 'image/jpeg',
    width: 1200,
    height: 800,
    dataUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'urban-architecture-neon.jpg',
    size: 312000,
    type: 'image/jpeg',
    width: 1200,
    height: 800,
    dataUrl:
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'coffee-aesthetic-minimal.jpg',
    size: 198000,
    type: 'image/jpeg',
    width: 800,
    height: 1000,
    dataUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'fashion-editorial-portrait.jpg',
    size: 280000,
    type: 'image/jpeg',
    width: 800,
    height: 1200,
    dataUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
];
