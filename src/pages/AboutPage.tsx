import React, { useEffect, useState } from 'react';

const AboutPage: React.FC = () => {
  const [aboutContent, setAboutContent] = useState('');

  useEffect(() => {
    // Fetch the about.txt file from the public directory
    fetch('/about.txt')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load about content');
        }
        return response.text();
      })
      .then((text) => setAboutContent(text))
      .catch((error) => {
        console.error('Failed to load about content:', error);
        setAboutContent('Failed to load about content. Please try again later.');
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">About Readme Clubs</h1>
      <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-lg">
        {aboutContent}
      </pre>
    </div>
  );
};

export default AboutPage;