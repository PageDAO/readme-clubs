import { Link } from 'react-router-dom'
import { ForumCategory, FORUM_CATEGORIES } from '../../types/forum'

interface PostCardProps {
  post: {
    content: {
      body: string
      title?: string
      category?: ForumCategory
    }
    creator: string
    timestamp: number
    stream_id: string
  }
  style: React.CSSProperties
  href: string
}

const PostCard = ({ post, style, href }: PostCardProps) => {
  const category = FORUM_CATEGORIES.find(cat => cat.id === post.content.category)
  
  return (
    <Link to={href} style={style} className="block p-4 hover:bg-gray-50">
      <div className="border rounded-lg p-4 shadow-sm">
        {category && (
          <span className="inline-block px-2 py-1 text-sm rounded bg-blue-100 text-blue-800 mb-2">
            {category.label}
          </span>
        )}
        <h3 className="font-medium text-lg">
          {post.content.title || 'Untitled Post'}
        </h3>
        <p className="text-gray-600 mt-2 line-clamp-2">
          {post.content.body}
        </p>
        <div className="mt-2 text-sm text-gray-500">
          by {post.creator} • {new Date(post.timestamp * 1000).toLocaleDateString()}
        </div>
      </div>
    </Link>
  )
}

export default PostCard
