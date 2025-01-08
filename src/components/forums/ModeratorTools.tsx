// src/components/forum/ModeratorTools.tsx
import React, { useState } from 'react';
import { BookForum } from '../../types/forum';

interface ModeratorToolsProps {
  bookForum: BookForum;
}

const ModeratorTools: React.FC<ModeratorToolsProps> = ({ bookForum }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-yellow-800">
          Moderator Tools
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-yellow-800 hover:text-yellow-900"
        >
          {isExpanded ? 'Hide' : 'Show'} Tools
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Current Moderators</h4>
            <div className="space-y-2">
              {bookForum.forumData.moderators.map((modDid) => (
                <div key={modDid} className="flex justify-between items-center">
                  <span className="text-sm text-yellow-700">{modDid}</span>
                  <button className="text-red-500 hover:text-red-700 text-sm">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Add Moderator</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter moderator DID"
                className="flex-1 rounded-md border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
              />
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                Add
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Forum Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-yellow-500" />
                <span className="text-sm text-yellow-700">
                  Require post approval
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-yellow-500" />
                <span className="text-sm text-yellow-700">
                  Allow reading group creation
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorTools;