// src/contexts/ForumContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { useAccount } from 'wagmi';
import { useOrbis } from './OrbisContext';
import { BookForum } from '../types/forum';

interface ForumContextType {
  hasAccess: boolean;
  isModerator: boolean;
  checkForumAccess: (bookForum: BookForum) => Promise<boolean>;
  checkModeratorAccess: (bookForum: BookForum) => Promise<boolean>;
}

const ForumContext = createContext<ForumContextType | null>(null);

export const ForumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const { userDid } = useOrbis();
  const [hasAccess, setHasAccess] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  const checkForumAccess = async (bookForum: BookForum): Promise<boolean> => {
    // TODO: Implement actual NFT ownership check
    if (!address) return false;
    
    try {
      // For now, we'll return true for testing
      setHasAccess(true);
      return true;
    } catch (error) {
      console.error('Error checking forum access:', error);
      return false;
    }
  };

  const checkModeratorAccess = async (bookForum: BookForum): Promise<boolean> => {
    if (!userDid) return false;
    try {
      const isMod = bookForum.forumData.moderators.includes(userDid) || 
                   userDid === bookForum.forumData.authorDid;
      setIsModerator(isMod);
      return isMod;
    } catch (error) {
      console.error('Error checking moderator access:', error);
      return false;
    }
  };

  return (
    <ForumContext.Provider 
      value={{ 
        hasAccess, 
        isModerator, 
        checkForumAccess, 
        checkModeratorAccess 
      }}
    >
      {children}
    </ForumContext.Provider>
  );
};

export const useForumContext = () => {
  const context = useContext(ForumContext);
  if (!context) {
    throw new Error('useForumContext must be used within a ForumProvider');
  }
  return context;
};