interface FileUploadSectionProps {
  type: 'cover' | 'pdf' | 'epub'
  accept: string
  validate: (file: File) => boolean
  onFileSelect: (file: File | null) => void
  progress: number
}
export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  type,
  accept,
  validate,
  onFileSelect,
  progress
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && !validate(file)) {
      alert(`Invalid ${type} file type`)
      return
    }
    onFileSelect(file)
  }

  return (
    <div className="border-2 border-dashed p-4 rounded">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload {type.toUpperCase()}
      </label>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="w-full"
      />
      <p className="text-sm text-gray-500 mt-1">
        Accepted formats: {accept}
      </p>
      {progress > 0 && (
        <div className="mt-2">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}