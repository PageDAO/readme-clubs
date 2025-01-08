import { useState } from 'react'
import { ForumCategory, FORUM_CATEGORIES } from '../../types/forum'
import { getOrbisClient } from '../../services/orbis'

interface PostFormProps {
  contextId: string
  onSuccess: () => void
}

const PostForm = ({ contextId, onSuccess }: PostFormProps) => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<ForumCategory>(ForumCategory.PROJECT_UPDATES)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
  
    try {
      const orbis = getOrbisClient()
      await orbis.createPost({
        context: contextId,
        body: JSON.stringify({
          title,
          body,
          category
        })
      })
      
      setTitle('')
      setBody('')
      onSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }
  

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value as ForumCategory)}
          className="w-full rounded-lg border p-2"
        >
          {FORUM_CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-lg border p-2 h-32"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Posting...' : 'Create Post'}
      </button>
    </form>
  )
}

export default PostForm
