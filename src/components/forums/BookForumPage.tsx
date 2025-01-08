// src/components/forum/BookForumPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForumContext } from '../../contexts/ForumContext';
import { BookForum } from '../../types/forum';
import MainForumView from './MainForumView';
import ReadingGroupsView from './ReadingGroupsView';
import ModeratorTools from './ModeratorTools';
import BuyKeyComponent from './BuyKeyComponent';

const BookForumPage: React.FC = () => {
  const { bookId } = useParams();
  const { hasAccess, isModerator } = useForumContext();
  const [activeView, setActiveView] = useState<'main' | 'readingGroups'>('main');
  const [bookForum, setBookForum] = useState<BookForum | null>(null);

  useEffect(() => {
    // For testing, create a dummy forum
    setBookForum({
      contractAddress: '0x123...',
      forumData: {
        mainContextId: 'test-context-id',
        authorDid: 'author-did',
        moderators: [],
        readingGroups: {
          contextId: 'reading-groups-context'
        }
      }
    });
  }, [bookId]);

  if (!bookForum) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return <BuyKeyComponent bookForum={bookForum} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <nav className="flex space-x-4 mb-6">
        <button 
          onClick={() => setActiveView('main')}
          className={`px-4 py-2 rounded-lg ${
            activeView === 'main' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200'
          }`}
        >
          Main Discussion
        </button>
        <button 
          onClick={() => setActiveView('readingGroups')}
          className={`px-4 py-2 rounded-lg ${
            activeView === 'readingGroups' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200'
          }`}
        >
          Reading Groups
        </button>
      </nav>

      {isModerator && (
        <ModeratorTools bookForum={bookForum} />
      )}

      {activeView === 'main' ? (
        <MainForumView contextId={bookForum.forumData.mainContextId} />
      ) : (
        <ReadingGroupsView 
          bookForum={bookForum}
        />
      )}
    </div>
  );
};

export default BookForumPage;