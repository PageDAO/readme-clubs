// src/components/forum/MainForumView.tsx
import React from 'react';
import { useOrbis } from '../../contexts/OrbisContext';
import { PostList } from './PostList';
import CreatePost from './CreatePost';

interface MainForumViewProps {
  contextId: string;
}

const MainForumView: React.FC<MainForumViewProps> = ({ contextId }) => {
  const { isConnected } = useOrbis();

  return (
    <div className="space-y-4">
      {isConnected && (
        <CreatePost contextId={contextId} />
      )}
      <PostList forumId={contextId} />
    </div>
  );
};

export default MainForumView;
