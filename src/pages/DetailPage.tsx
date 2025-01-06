import React from 'react';
import { useParams } from 'react-router-dom';
import useBooks from '../hooks/useBooks';

const DetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { books, isLoading, error } = useBooks();
  const book = books.find((b) => b.id === bookId);

  if (isLoading) {
    return <div>Loading book details...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!book) {
    return <div>Book not found</div>;
  }

  return (
    <div className="p-4">
      <div className="text-center">
        {/* Image container with fixed size */}
        <div className="w-64 h-64 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold mt-4">{book.title}</h1>
        <h2 className="text-xl text-gray-600">By {book.author}</h2>
        <p className="mt-4 text-gray-700">{book.description}</p>
        {book.interactiveUrl && (
          <iframe
            src={book.interactiveUrl}
            title="Interactive Content"
            className="w-full h-64 mt-4"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default DetailPage;