// src/components/forum/ReadingGroupsView.tsx
import React, { useState, useEffect } from 'react';
import { useOrbis } from '../../contexts/OrbisContext';
import { BookForum, PostingAccess } from '../../types/forum';
import { PostList } from './postlist';

interface ReadingGroup {
  stream_id: string;
  name: string;
  description: string;
  createdBy: string;
  postingAccess: PostingAccess;
  posts?: string[];
}

interface ReadingGroupsViewProps {
  bookForum: BookForum;
}

const ReadingGroupsView: React.FC<ReadingGroupsViewProps> = ({ bookForum }) => {
  const { orbis } = useOrbis();
  const [readingGroups, setReadingGroups] = useState<ReadingGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ReadingGroup | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadReadingGroups();
  }, [bookForum.forumData.mainContextId]);

  const loadReadingGroups = async () => {
    try {
      const response = await orbis.getPosts({
        context: bookForum.forumData.mainContextId
      });

      if (response.data && Array.isArray(response.data)) {
        // Filter posts that are reading groups based on their data type
        const groups = response.data
          .filter(post => post.data?.type === 'reading_group')
          .map(post => ({
            stream_id: post.stream_id,
            name: post.data?.name || 'Unnamed Group',
            description: post.content.body,
            createdBy: post.creator,
            postingAccess: post.data?.postingAccess || PostingAccess.EVERYONE,
            posts: []
          }));
        setReadingGroups(groups);
      }
    } catch (error) {
      console.error('Error loading reading groups:', error);
    }
  };

  const handleCreateGroup = async (group: ReadingGroup) => {
    setReadingGroups([...readingGroups, group]);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reading Groups</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create New Group
        </button>
      </div>

      {isCreating ? (
        <CreateReadingGroup
          bookForum={bookForum}
          onClose={() => setIsCreating(false)}
          onCreated={handleCreateGroup}
        />
      ) : selectedGroup ? (
        <ReadingGroupDetail
          group={selectedGroup}
          contextId={bookForum.forumData.mainContextId}
          onBack={() => setSelectedGroup(null)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {readingGroups.map((group) => (
            <div
              key={group.stream_id}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedGroup(group)}
            >
              <h3 className="text-xl font-bold mb-2">{group.name}</h3>
              <p className="text-gray-600">{group.description}</p>
              <div className="mt-4 text-sm text-gray-500">
                Posts are {group.postingAccess.toLowerCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateReadingGroup: React.FC<{
    bookForum: BookForum;
    onClose: () => void;
    onCreated: (group: ReadingGroup) => void;
  }> = ({ bookForum, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [postingAccess, setPostingAccess] = useState<PostingAccess>(PostingAccess.EVERYONE);
    const { orbis } = useOrbis();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        // Type assertion for the createPost parameters
        const res = await orbis.createPost({
          context: bookForum.forumData.mainContextId,
          body: description,
          data: {
            type: 'reading_group',
            name,
            postingAccess,
          }
        } as any); // Using type assertion here
  
        if (res.status === 200) {
          const newGroup: ReadingGroup = {
            stream_id: res.doc,
            name,
            description,
            createdBy: res.doc_id,
            postingAccess,
            posts: []
          };
          onCreated(newGroup);
        }
      } catch (error) {
        console.error('Error creating reading group:', error);
      }
    };
  
  

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Group Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Posting Access
          </label>
          <select
            value={postingAccess}
            onChange={(e) => setPostingAccess(e.target.value as PostingAccess)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={PostingAccess.EVERYONE}>Everyone</option>
            <option value={PostingAccess.CREATOR_ONLY}>Creator Only</option>
            <option value={PostingAccess.MODERATED}>Moderated</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create Group
          </button>
        </div>
      </div>
    </form>
  );
};

const ReadingGroupDetail: React.FC<{
  group: ReadingGroup;
  contextId: string;
  onBack: () => void;
}> = ({ group, contextId, onBack }) => {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-blue-500 hover:text-blue-700"
      >
        ← Back to Groups
      </button>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h3 className="text-xl font-bold mb-2">{group.name}</h3>
        <p className="text-gray-600 mb-4">{group.description}</p>
      </div>
      <PostList 
        forumId={contextId}
        filter={{ groupId: group.stream_id }}
      />
    </div>
  );
};

export default ReadingGroupsView;