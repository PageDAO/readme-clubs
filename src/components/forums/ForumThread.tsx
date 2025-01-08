import React from 'react';

interface ForumThreadProps {
  thread: {
    stream_id: string;
    content: {
      title: string;
      body: string;
    };
  };
}

const ForumThread: React.FC<ForumThreadProps> = ({ thread }) => {
  return (
    <div className="p-4 border-b">
      <h2 className="text-xl font-bold">{thread.content.title}</h2>
      <p>{thread.content.body}</p>
    </div>
  );
};

export default ForumThread;