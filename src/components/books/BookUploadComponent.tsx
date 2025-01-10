import React, { useState } from 'react'
import { useWriteContract, useAccount, useChainId } from 'wagmi'
import { ArweaveService } from '../../services/arweaveService'
import { CONTRACTS } from '../../config/contracts'
import { README_1155_ABI } from '../../config/abis/readme1155'

const BookUploadComponent: React.FC = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  
  const [files, setFiles] = useState<{
    pdf: File | null,
    epub: File | null,
    cover: File | null
  }>({
    pdf: null,
    epub: null,
    cover: null
  })
  
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    description: ''
  })

  const { writeContract, isPending, isSuccess } = useWriteContract()

  const handleUpload = async () => {
    const arweaveService = new ArweaveService()
    
    const result = await arweaveService.uploadBookContent({
      pdf: files.pdf!,
      epub: files.epub!,
      cover: files.cover!,
      metadata: {
        ...metadata,
        formats: {
          pdf: {
            size: files.pdf!.size,
            type: files.pdf!.type
          },
          epub: {
            size: files.epub!.size,
            type: files.epub!.type
          }
        }
      }
    })

    writeContract({
      abi: README_1155_ABI,
      address: CONTRACTS.README_1155 as `0x${string}`,
      functionName: 'mint',
      args: [
        metadata.title,
        metadata.author,
        result.metadataHash,
        `ar://${result.metadataHash}`
      ]
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Upload Book</h2>
      
      <div className="space-y-4">
        <input
          type="file"
          accept=".pdf"
          onChange={e => setFiles(prev => ({ ...prev, pdf: e.target.files?.[0] || null }))}
        />
        
        <input
          type="file"
          accept=".epub"
          onChange={e => setFiles(prev => ({ ...prev, epub: e.target.files?.[0] || null }))}
        />
        
        <input
          type="file"
          accept="image/*"
          onChange={e => setFiles(prev => ({ ...prev, cover: e.target.files?.[0] || null }))}
        />

        <input
          type="text"
          placeholder="Book Title"
          onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Author"
          onChange={e => setMetadata(prev => ({ ...prev, author: e.target.value }))}
          className="w-full p-2 border rounded"
        />

        <textarea
          placeholder="Description"
          onChange={e => setMetadata(prev => ({ ...prev, description: e.target.value }))}
          className="w-full p-2 border rounded"
        />

        <button
          onClick={handleUpload}
          disabled={isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isPending ? 'Uploading...' : 'Upload and Mint'}
        </button>

        {isSuccess && (
          <div className="text-green-500">
            Book successfully uploaded and minted!
          </div>
        )}
      </div>
    </div>
  )
}

export default BookUploadComponent
