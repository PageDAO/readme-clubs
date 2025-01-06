import React from 'react';
import { ForumThread as ForumThreadType } from '../../types';

interface ForumThreadListProps {
  threads: ForumThreadType[];
}

const ForumThreadList: React.FC<ForumThreadListProps> = ({ threads }) => {
  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <div key={thread.id} className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold">{thread.title}</h3>
          <p className="text-gray-600">By {thread.author}</p>
          <p className="text-sm text-gray-500">
            {thread.replies} replies · Last activity: {thread.lastActivity}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ForumThreadList;