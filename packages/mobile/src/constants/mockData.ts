import type { Product } from '@/types';

export const featuredProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Noise Cancelling Headphones',
    description: 'Premium over-ear sound with all-day battery life.',
    price: 249.99,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    ],
    inventory: 18,
    category: { id: 'cat-1', name: 'Electronics' },
    reviews: [],
    rating: 4.8,
    featured: true,
  },
  {
    id: 'prod-2',
    name: 'Minimal Everyday Backpack',
    description: 'Weather-resistant backpack built for work, gym, and travel.',
    price: 89,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    ],
    inventory: 44,
    category: { id: 'cat-2', name: 'Accessories' },
    reviews: [],
    rating: 4.5,
    featured: true,
  },
];
