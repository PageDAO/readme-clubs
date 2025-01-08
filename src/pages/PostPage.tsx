// src/pages/PostPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orbis } from '../services/orbisClient';

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

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!postId) throw new Error('No post ID provided');
        
        console.log('Fetching post with ID:', postId); // Debug log
        
        // Use stream_id to fetch the specific post
        const response = await orbis.getPosts({ stream_id: postId } as any);
        console.log('Response:', response); // Debug log
        
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          setPost(response.data[0]);
        } else {
          throw new Error('Post not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err); // Debug log
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Link to="/forum" className="text-blue-500 hover:text-blue-700">
          ← Back to Forum
        </Link>
      </div>
    );
  }
  if (!post) return <div className="p-4">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/forum" className="text-blue-500 hover:text-blue-700 mb-4 block">
        ← Back to Forum
      </Link>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="font-medium text-gray-900">
            {post.creator_details?.profile?.username || 'Anonymous'}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(post.timestamp * 1000).toLocaleString()}
          </div>
        </div>
        <div className="text-gray-700 text-lg">
          {post.content.body}
        </div>
      </div>
    </div>
  );
};

export default PostPage;