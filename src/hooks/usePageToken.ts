import { useAccount, useContractRead, useChainId } from 'wagmi'
import { erc20Abi } from 'viem'
import { PAGE_TOKEN_ADDRESSES } from '../config/contracts'

const MIN_TOKENS_REQUIRED = 1 // Minimum $PAGE tokens needed for access

export function usePageToken() {
  const { address } = useAccount()
  const chainId = useChainId()
  const pageTokenAddress = PAGE_TOKEN_ADDRESSES[chainId]

  const { data: balance } = useContractRead({
    address: pageTokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address
    }
  })

  const hasAccess = balance ? balance >= MIN_TOKENS_REQUIRED : false

  return { hasAccess, balance }
}