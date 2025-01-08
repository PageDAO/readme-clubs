import { useAccount, useContractRead } from 'wagmi'
import { erc20Abi } from 'viem'

const PAGE_TOKEN_ADDRESS = '0xc4730f86d1F86cE0712a7b17EE919Db7dEFad7FE'
const MIN_TOKENS_REQUIRED = 1 // Minimum $PAGE tokens needed for access

export function usePageToken() {
  const { address } = useAccount()

  const { data: balance } = useContractRead({
    address: PAGE_TOKEN_ADDRESS,
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
