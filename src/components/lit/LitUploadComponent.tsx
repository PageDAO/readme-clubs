import React, { useState } from 'react'
import { useWriteContract, useAccount, useChainId, useWalletClient } from 'wagmi'
import { publicMintService } from '../../services/mint/publicMintService'
import { CONTRACTS } from '../../config/contracts'
import { README_1155_ABI } from '../../config/abis/readme1155'
import type { EnhancedBookMetadata } from '../../services/mint/types'
import { DisplayLitUpload } from './DisplayLitUpload'

const LitUploadComponent: React.FC = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const { data: walletClient } = useWalletClient()
  const { writeContract, isPending, isSuccess } = useWriteContract()

  const [files, setFiles] = useState<{
    pdf: File | null,
    epub: File | null,
    cover: File | null
  }>({
    pdf: null,
    epub: null,
    cover: null
  })

  const [metadata, setMetadata] = useState<EnhancedBookMetadata>({
    title: '',
    author: '',
    description: '',
    language: { code: 'en', name: 'English' },
    bisacCodes: [],
    coverArtist: '',
    bookType: '',
    keywords: []
  })

  const [uploadState, setUploadState] = useState<'idle' | 'creating' | 'uploading' | 'minting'>('idle')
  const [directoryId, setDirectoryId] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!walletClient) return
    
    try {
      setUploadState('creating')
      const { directoryId } = await publicMintService.initializeMint(metadata, walletClient)
      setDirectoryId(directoryId)
      
      setUploadState('uploading')
      const result = await publicMintService.uploadFiles(directoryId, {
        pdf: files.pdf!,
        epub: files.epub!,
        cover: files.cover!
      })

      setUploadState('minting')
      writeContract({
        abi: README_1155_ABI,
        address: CONTRACTS.README_1155 as `0x${string}`,
        functionName: 'mint',
        args: [
          metadata.title,
          metadata.author,
          result.contentHash,
          `ar://${result.contentHash}`
        ]
      })      
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadState('idle')
    }
  }

  return (
    <DisplayLitUpload
      metadata={metadata}
      setMetadata={setMetadata}
      files={files}
      setFiles={setFiles}
      uploadState={uploadState}
      isPending={isPending}
      isSuccess={isSuccess}
      onUpload={handleUpload}
    />
  )
}

export default LitUploadComponent
