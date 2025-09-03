
export interface Filter {
  id: string;
  name: string;
  description: string;
  prompt: string;
  previewImageUrl: string;
  category: string;
  userId?: string;
  username?: string;
}

export interface User {
    uid: string;
    email: string;
    idToken: string;
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
  | { view: 'auth' }
  | { view: 'shared'; shareId: string };
