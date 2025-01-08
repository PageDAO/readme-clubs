import React, { useEffect, useState } from 'react';
import { fetchPosts } from '../../services/orbisClient';

interface ForumThreadListProps {
  forumId: string;
}

const ForumThreadList: React.FC<ForumThreadListProps> = ({ forumId }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await fetchPosts(forumId);
        setPosts(posts);
      } catch (error) {
        console.error('Error loading posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [forumId]);

  if (isLoading) {
    return <p>Loading posts...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.stream_id} className="p-4 border-b">
            <p>{post.content.body}</p>
          </div>
        ))
      ) : (
        <p>No posts found.</p>
      )}
    </div>
  );
};

export default ForumThreadList;