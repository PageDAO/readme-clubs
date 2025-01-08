import { useState } from 'react'
import { FixedSizeList } from 'react-window'
import { useInfiniteQuery } from '@tanstack/react-query'
import { usePageToken } from '../../hooks/usePageToken'
import { ForumCategory } from '../../types/forum'
import { Post } from '../../types/post'
import { getOrbisClient } from '../../services/orbis'
import CategorySelector from './CategorySelector'
import PostCard from './PostCard'

const fetchPosts = async (
  contextId: string,
  pageParam: number,
  category: ForumCategory | null
): Promise<Post[]> => {
  const orbis = getOrbisClient()
  const posts = await orbis.getPosts({
    context: contextId
  })

  const filteredPosts = posts.data.filter(post => {
    if (!category) return true
    return post.content.category === category
  }).map(post => ({
    ...post,
    content: {
      ...post.content,
      category: post.content.category || ForumCategory.PROJECT_UPDATES
    }
  }))

  return filteredPosts || []
}

const ForumList = ({ contextId, bookId }: { contextId: string, bookId?: string }) => {
  const { hasAccess } = usePageToken()
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null)
  
  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['posts', contextId, selectedCategory],
    queryFn: ({ pageParam = 0 }) => fetchPosts(contextId, pageParam, selectedCategory),
    getNextPageParam: (lastPage) => lastPage.length ? lastPage.length : undefined,
    initialPageParam: 0,
    enabled: hasAccess
  })

  if (!hasAccess) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-4">Members Only Area</h2>
        <p>Hold $PAGE tokens to access the PageDAO forum</p>
      </div>
    )
  }

  const allPosts = data?.pages?.flat() || []

  return (
    <div>
      <CategorySelector 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <FixedSizeList
        height={800}
        width={1000}
        itemCount={allPosts.length}
        itemSize={120}
      >
        {({ index, style }) => (
          <PostCard
            style={style}
            post={allPosts[index]}
            href={bookId ? `/books/${bookId}/forum/${allPosts[index].stream_id}` : `/forum/${allPosts[index].stream_id}`}
          />
        )}
      </FixedSizeList>
    </div>
  )
}

export default ForumList
