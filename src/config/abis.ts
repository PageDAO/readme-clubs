export const KEY_FACTORY_ABI = [
  {
    inputs: [
      { internalType: "address", name: "books1155Token", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" }
    ],
    name: "createKeyToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "books1155Token", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "getKeyToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;
