import { useState, useEffect } from 'react';
import { Book } from '../types';

const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        // Fetch the index using the All Origins proxy
        const response = await fetch(
          `https://api.allorigins.win/get?url=${encodeURIComponent(
            'https://epicdylan.com/readme-index.json'
          )}`
        );
        const data = await response.json();
        const booksData = JSON.parse(data.contents).books;

        // Fetch metadata for all books
        const booksWithMetadata = await Promise.all(
          booksData.map(async ({ tokenId, uri }: { tokenId: string; uri: string }) => {
            try {
              const metadataResponse = await fetch(uri);
              if (!metadataResponse.ok) {
                throw new Error(`HTTP error! Status: ${metadataResponse.status}`);
              }
              const metadata = await metadataResponse.json();
              return {
                id: tokenId,
                title: metadata.name || 'Unnamed Book',
                author: metadata.attributes?.find((attr: any) => attr.trait_type === 'Author(s)')?.value || 'Unknown Author',
                coverImage: metadata.image || 'placeholder.png',
                description: metadata.description || 'No description available.',
                interactiveUrl: metadata.interactive_url,
              };
            } catch (error) {
              console.error(`Failed to fetch metadata for token ID ${tokenId}:`, error);
              return {
                id: tokenId,
                title: 'Unnamed Book',
                author: 'Unknown Author',
                coverImage: 'placeholder.png',
                description: 'No description available.',
                interactiveUrl: '',
              };
            }
          })
        );

        setBooks(booksWithMetadata);
      } catch (error) {
        console.error('Error loading index or metadata:', error);
        setError('Failed to load books. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return { books, isLoading, error };
};

export default useBooks;