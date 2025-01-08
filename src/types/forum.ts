// src/types/forum.ts
export interface BookForum {
    contractAddress: string;
    tokenId?: string;
    forumData: {
      mainContextId: string;
      authorDid: string;
      moderators: string[];
      readingGroups: {
        contextId: string;
      }
    }
  }
  
  export interface ReadingGroup {
    id: string;
    contextId: string;
    name: string;
    description: string;
    createdBy: string;
    postingAccess: PostingAccess;
  }
  
  export enum PostingAccess {
    EVERYONE = 'everyone',
    CREATOR_ONLY = 'creator',
    MODERATED = 'moderated'
  }
  
  export interface Post {
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