import React from 'react';
import { Link } from 'react-router-dom';
import useBooks from '../../hooks/useBooks';

const BookList: React.FC = () => {
  const { books, isLoading, error } = useBooks();

  if (isLoading) {
    return <p>Loading books...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      {books.map((book) => (
        <div key={book.id} className="p-4 border-b">
          <h2>{book.title}</h2>
          <p>{book.description}</p>
          <Link to={`/forum/${book.id}`} className="text-blue-500">
            Go to Forum
          </Link>
        </div>
      ))}
    </div>
  );
};

export default BookList;