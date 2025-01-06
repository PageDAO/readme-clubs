import React, { useState } from 'react';
import { Book } from '../../types';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const [showPopup, setShowPopup] = useState(false);

  const cleanDescription = (description: string) => {
    if (!description) return 'No description available.';
    return description.replace(/View on IPFS:\s*https?:\/\/[^\s]+/g, '').trim();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      {/* Image container with fixed size */}
      <div className="w-full h-64 flex items-center justify-center bg-gray-100">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold">{book.title}</h3>
        <p className="text-sm text-gray-600">By {book.author}</p>
        <button
          onClick={() => setShowPopup(true)}
          className="mt-2 text-blue-500 hover:underline self-start"
        >
          Readme
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">{book.title}</h2>
            <p className="text-gray-700">{cleanDescription(book.description)}</p>
            {book.interactiveUrl && (
              <iframe
                src={book.interactiveUrl}
                title="Interactive Content"
                className="w-full h-64 mt-4"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCard;