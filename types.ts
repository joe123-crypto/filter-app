
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

export type ViewState =
  | { view: 'marketplace' }
  | { view: 'apply'; filter: Filter }
  | { view: 'create' }
  | { view: 'auth' };
