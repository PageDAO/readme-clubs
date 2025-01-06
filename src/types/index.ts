export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  interactiveUrl?: string;
}

export interface User {
  name: string;
  profileImage: string;
  bookshelfCount: number;
  clubsJoined: number;
  slug: string;
}

export interface ForumThread {
  id: number;
  title: string;
  author: string;
  replies: number;
  lastActivity: string;
}