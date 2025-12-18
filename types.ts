
export enum ImageStyle {
  NINETIES_CARTOON = '90s Cartoon',
  ANIME = 'Anime',
  COMIC_HERO = 'Comic Hero',
  HYPER_REALISTIC = 'Hyper-Realistic',
  PHOTO_REALISTIC = 'Photo-Realistic'
}

export enum AspectRatio {
  SIXTEEN_NINE = '16:9',
  NINE_SIXTEEN = '9:16',
  ONE_ONE = '1:1',
  FOUR_THREE = '4:3',
  CUSTOM = 'Custom'
}

export interface Character {
  id: number;
  name: string;
  image: string | null;
  mimeType: string | null;
  rotation: number;
  isSelected: boolean;
}

export interface GeneratedImageResult {
  id: string;
  prompt: string;
  imageData: string;
}
