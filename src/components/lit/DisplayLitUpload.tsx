import React from 'react'
import { LanguageSelect } from '../mint/metadata/LanguageSelect'
import { BisacSelect } from '../mint/metadata/BisacSelect'
import type { EnhancedBookMetadata } from '../../services/mint/types'

interface DisplayLitUploadProps {
  metadata: EnhancedBookMetadata
  setMetadata: React.Dispatch<React.SetStateAction<EnhancedBookMetadata>>
  files: {
    pdf: File | null
    epub: File | null
    cover: File | null
  }
  setFiles: React.Dispatch<React.SetStateAction<{
    pdf: File | null
    epub: File | null
    cover: File | null
  }>>
  uploadState: 'idle' | 'creating' | 'uploading' | 'minting'
  isPending: boolean
  isSuccess: boolean
  onUpload: () => Promise<void>
}

export const DisplayLitUpload: React.FC<DisplayLitUploadProps> = ({
  metadata,
  setMetadata,
  files,
  setFiles,
  uploadState,
  isPending,
  isSuccess,
  onUpload
}) => {
  const isFormDisabled = uploadState !== 'idle'

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Upload Your Literary Asset</h2>
      <div className="space-y-6">
        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: 'pdf', accept: '.pdf', label: 'PDF File' },
            { type: 'epub', accept: '.epub', label: 'EPUB File' },
            { type: 'cover', accept: 'image/*', label: 'Cover Image' }
          ].map(({ type, accept, label }) => (
            <div key={type} className="border-2 border-dashed p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
              </label>
              <input
                type="file"
                accept={accept}
                onChange={e => setFiles(prev => ({
                  ...prev,
                  [type]: e.target.files?.[0] || null
                }))}
                disabled={isFormDisabled}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Metadata Fields */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={metadata.title}
            onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
            disabled={isFormDisabled}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            placeholder="Author"
            value={metadata.author}
            onChange={e => setMetadata(prev => ({ ...prev, author: e.target.value }))}
            disabled={isFormDisabled}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            placeholder="Cover Artist"
            value={metadata.coverArtist}
            onChange={e => setMetadata(prev => ({ ...prev, coverArtist: e.target.value }))}
            disabled={isFormDisabled}
            className="w-full p-2 border rounded"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <LanguageSelect
              value={metadata.language.code}
              onChange={language => setMetadata(prev => ({ ...prev, language }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BISAC Categories
            </label>
            <BisacSelect
              values={metadata.bisacCodes.map(code => code.code)}
              onChange={codes => setMetadata(prev => ({ ...prev, bisacCodes: codes }))}
            />
          </div>

          <textarea
            placeholder="Description"
            value={metadata.description}
            onChange={e => setMetadata(prev => ({ ...prev, description: e.target.value }))}
            disabled={isFormDisabled}
            rows={4}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            placeholder="Keywords (comma-separated)"
            value={metadata.keywords.join(', ')}
            onChange={e => setMetadata(prev => ({
              ...prev,
              keywords: e.target.value.split(',').map(k => k.trim())
            }))}
            disabled={isFormDisabled}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Status and Actions */}
        <div className="space-y-4">
          <button
            onClick={onUpload}
            disabled={isPending || isFormDisabled}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {uploadState === 'creating' ? 'Creating Directory...' :
             uploadState === 'uploading' ? 'Uploading Files...' :
             uploadState === 'minting' ? 'Minting NFT...' :
             'Upload and Mint'}
          </button>

          {isSuccess && (
            <div className="text-green-500">
              Your literature has been successfully uploaded and minted!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
