// src/pages/ForumPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { PostList } from '../components/forums/postlist';

const FORUM_CONTEXT_ID = 'kjzl6cwe1jw1493t92y0tygz2bh5fxa28b0j32sw21d72q0lcqccnh0zyxtbrpv';

const ForumPage = () => {
  const { forumId = FORUM_CONTEXT_ID } = useParams();


  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Forum</h1>
      </div>
      
      <PostList forumId={forumId} />
    </div>
  );
};

export default ForumPage;