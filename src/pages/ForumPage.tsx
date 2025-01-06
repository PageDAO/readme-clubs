import React from 'react';
import ForumThread from '../features/forum/ForumThreadList';
import { ForumThread as ForumThreadType } from '../types';

const mockThreads: ForumThreadType[] = [
  {
    id: 1,
    title: 'What did you think of Chapter 1?',
    author: 'User1',
    replies: 5,
    lastActivity: '2 hours ago',
  },
  {
    id: 2,
    title: 'Favorite character so far?',
    author: 'User2',
    replies: 12,
    lastActivity: '1 day ago',
  },
];

const ForumPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Forum</h1>
      <ForumThread threads={mockThreads} />
    </div>
  );
};

export default ForumPage;