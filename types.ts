export interface Filter {
  id: string;
  name: string;
  description: string;
  prompt: string;
  previewImageUrl: string;
  category: string;
  type?: 'single' | 'merge'; // Add new type property
  userId?: string;
  username?: string;
  accessCount?: number;
  // FIX: Add optional createdAt property to match Firestore data and fix destructuring in App.tsx.
  createdAt?: string;
}

export interface User {
    uid: string;
    email: string;
    idToken: string;
    refreshToken: string;
    expiresAt: number;
}

export interface Share {
    id: string;
    imageUrl: string;
    userId?: string;
    username?: string;

    filterId: string;
    filterName: string;
    createdAt: string;
}

export type ViewState =
  | { view: 'marketplace' }
  | { view: 'apply'; filter: Filter }
  | { view: 'create' }
  | { view: 'edit'; filter: Filter }
  | { view: 'auth' }
  | { view: 'shared'; shareId: string };