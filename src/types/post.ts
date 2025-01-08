import { ForumCategory } from './forum'

export interface Post {
  content: {
    body: string
    title?: string
    category?: ForumCategory
  }
  creator: string
  timestamp: number
  stream_id: string
}
