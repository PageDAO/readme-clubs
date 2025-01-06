import React from 'react';
import BookGrid from '../features/books/BookGrid';
import useBooks from '../hooks/useBooks';

const BrowseBooksPage: React.FC = () => {
  const { books, isLoading, error } = useBooks();

  if (isLoading) {
    return <div>Loading books...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Browse Books</h1>
      <BookGrid books={books} />
    </div>
  );
};

export default BrowseBooksPage;