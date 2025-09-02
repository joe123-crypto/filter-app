
import { Filter } from './types';

export const INITIAL_FILTERS: Filter[] = [
  {
    id: '1',
    name: 'Oil Painting',
    description: 'Transform your photo into a classic oil painting with rich, textured colors.',
    prompt: 'Convert this image into the style of a classical oil painting, with visible brush strokes and rich, textured colors.',
    previewImageUrl: 'https://picsum.photos/seed/oilpaint/500/500',
  },
  {
    id: '2',
    name: 'Anime Scenery',
    description: 'Give your image a vibrant, anime-style background look with dramatic lighting.',
    prompt: 'Redraw this image in a vibrant, detailed anime scenery style, similar to the backgrounds in a high-quality animated film. Focus on dramatic lighting and saturated colors.',
    previewImageUrl: 'https://picsum.photos/seed/anime/500/500',
  },
  {
    id: '3',
    name: 'Vintage Film',
    description: 'Apply a nostalgic, vintage film grain effect with muted colors.',
    prompt: 'Apply a vintage film effect to this image. Add film grain, slightly muted colors, and a subtle light leak effect in one of the corners to give it an authentic, retro feel.',
    previewImageUrl: 'https://picsum.photos/seed/vintage/500/500',
  },
    {
    id: '4',
    name: 'Cyberpunk Glow',
    description: 'Bathe your image in neon lights and a futuristic cyberpunk aesthetic.',
    prompt: 'Transform this image with a cyberpunk aesthetic. Add glowing neon lights, rain-slicked surfaces, and a cool, futuristic color palette of blues and purples.',
    previewImageUrl: 'https://picsum.photos/seed/cyberpunk/500/500',
  },
];
