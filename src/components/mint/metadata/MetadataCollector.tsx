import { useState } from 'react';
import { LanguageSelect } from './LanguageSelect';
import { BisacSelect } from './BisacSelect';
import type { EnhancedBookMetadata } from '../../../services/mint/types';

export const MetadataCollector: React.FC<{
  onMetadataComplete: (metadata: EnhancedBookMetadata) => void;
}> = ({ onMetadataComplete }) => {
  const [metadata, setMetadata] = useState<EnhancedBookMetadata>({
    title: '',
    author: '',
    coverArtist: '',
    language: { code: 'en', name: 'English' },
    bisacCodes: [],
    description: '',
    bookType: '',
    keywords: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMetadataComplete(metadata);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            required
            value={metadata.title}
            onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Author</label>
          <input
            type="text"
            required
            value={metadata.author}
            onChange={e => setMetadata(prev => ({ ...prev, author: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cover Artist</label>
          <input
            type="text"
            required
            value={metadata.coverArtist}
            onChange={e => setMetadata(prev => ({ ...prev, coverArtist: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <LanguageSelect
            value={metadata.language.code}
            onChange={language => setMetadata(prev => ({ ...prev, language }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">BISAC Categories</label>
        <BisacSelect
          values={metadata.bisacCodes.map(code => code.code)}
          onChange={codes => setMetadata(prev => ({ ...prev, bisacCodes: codes }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          required
          value={metadata.description}
          onChange={e => setMetadata(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Keywords</label>
        <input
          type="text"
          value={metadata.keywords.join(', ')}
          onChange={e => setMetadata(prev => ({ 
            ...prev, 
            keywords: e.target.value.split(',').map(k => k.trim()) 
          }))}
          placeholder="Separate keywords with commas"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Continue to Upload
      </button>
    </form>
  );
};