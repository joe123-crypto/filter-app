
export interface Filter {
  id: string;
  name: string;
  description: string;
  prompt: string;
  previewImageUrl: string;
}

export type ViewState =
  | { view: 'marketplace' }
  | { view: 'apply'; filter: Filter }
  | { view: 'create' };
