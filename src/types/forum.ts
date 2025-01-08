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

export enum ForumCategory {
  TECH_SUPPORT = 'tech-support',
  COMMUNITY_EVENTS = 'community-events',
  PROJECT_UPDATES = 'project-updates'
}

export interface CategoryInfo {
  id: ForumCategory
  label: string
  description: string
}

export const FORUM_CATEGORIES: CategoryInfo[] = [
  {
    id: ForumCategory.TECH_SUPPORT,
    label: 'Technical Support',
    description: 'Get help with wallet connections, token issues, and technical questions'
  },
  {
    id: ForumCategory.COMMUNITY_EVENTS,
    label: 'Community Events',
    description: 'Upcoming events, meetups, and community gatherings'
  },
  {
    id: ForumCategory.PROJECT_UPDATES,
    label: 'Project Updates',
    description: 'Latest news and updates about PageDAO projects'
  }
]
