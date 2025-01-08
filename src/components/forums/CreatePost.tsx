// src/components/CreatePost.tsx
import React, { useState } from 'react';
import { useOrbis } from '../../contexts/OrbisContext';

interface CreatePostProps {
  contextId: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ contextId }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { orbis } = useOrbis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await orbis.createPost({
        context: contextId,
        body: content
      });

      if (res.status === 200) {
        setContent('');
        // You might want to add a callback to refresh the post list
        console.log('Post created successfully:', res);
      } else {
        console.error('Error creating post:', res);
      }
    } catch (error) {
      console.error('Error in createPost:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full min-h-[100px] p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={`px-4 py-2 rounded-lg text-white ${
              isSubmitting || !content.trim()
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;