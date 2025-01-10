export const README_1155_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'string', name: 'author', type: 'string' },
      { internalType: 'string', name: 'arweaveHash', type: 'string' },
      { internalType: 'string', name: 'metadataURI', type: 'string' }
    ],
    name: 'mint',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'getBookDetails',
    outputs: [{
      components: [
        { internalType: 'string', name: 'title', type: 'string' },
        { internalType: 'string', name: 'author', type: 'string' },
        { internalType: 'string', name: 'arweaveHash', type: 'string' },
        { internalType: 'string', name: 'metadataURI', type: 'string' },
        { internalType: 'uint256', name: 'mintTimestamp', type: 'uint256' },
        { internalType: 'address', name: 'publisher', type: 'address' }
      ],
      internalType: 'struct Readme1155v1.BookMetadata',
      type: 'tuple'
    }],
    stateMutability: 'view',
    type: 'function'
  }
] as const