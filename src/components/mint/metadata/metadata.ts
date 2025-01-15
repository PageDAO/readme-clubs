export interface EnhancedBookMetadata {
  title: string;
  author: string;
  coverArtist: string;
  language: {
    code: string;
    name: string;
  };
  bisacCodes: Array<{
    code: string;
    description: string;
  }>;
  description: string;
  bookType: string;
  keywords: string[];
  series?: {
    name: string;
    position: number;
  };
}
