// src/components/PostList.tsx
import React, { useEffect, useState } from 'react';
import { fetchPosts } from '../../services/orbisClient';
import { Link } from 'react-router-dom';

interface Post {
  content: {
    body: string;
  };
  creator: string;
  creator_details?: {
    profile?: {
      username?: string;
    };
  };
  timestamp: number;
  stream_id: string;
}

interface PostListProps {
  forumId: string;
}

export const PostList = ({ forumId }: PostListProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await fetchPosts(forumId);
        setPosts(fetchedPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [forumId]);

  if (loading) {
    return <div className="flex justify-center p-4">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (posts.length === 0) {
    return <div className="text-gray-500 p-4">No posts yet. Be the first to post!</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {posts.map((post) => (
        <Link 
          to={`/post/${post.stream_id}`} 
          key={post.stream_id}
          className="block hover:shadow-lg transition-shadow duration-200"
        >
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-gray-900">
                {post.creator_details?.profile?.username || 'Anonymous'}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(post.timestamp * 1000).toLocaleString()}
              </div>
            </div>
            <div className="text-gray-700">
              {post.content.body}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};