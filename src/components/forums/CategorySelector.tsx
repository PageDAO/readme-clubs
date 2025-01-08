import { ForumCategory, FORUM_CATEGORIES } from '../../types/forum'

interface CategorySelectorProps {
  selectedCategory: ForumCategory | null
  onSelectCategory: (category: ForumCategory | null) => void
}

const CategorySelector = ({ selectedCategory, onSelectCategory }: CategorySelectorProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-4">
        {FORUM_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategorySelector
