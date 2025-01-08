import React from 'react'
import { useParams } from 'react-router-dom'
import ForumList from '../components/forums/ForumList'

const FORUM_CONTEXT_ID = 'kjzl6cwe1jw1493t92y0tygz2bh5fxa28b0j32sw21d72q0lcqccnh0zyxtbrpv'

const ForumPage = () => {
  const { bookId } = useParams()
  const contextId = bookId ? `book-${bookId}` : FORUM_CONTEXT_ID

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          {bookId ? 'Book Discussion' : 'Forum'}
        </h1>
      </div>
      
      <ForumList contextId={contextId} bookId={bookId} />
    </div>
  )
}

export default ForumPage
