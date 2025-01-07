import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useContractRead } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import UniswapModal from '../features/web3/UniswapModal';

// Contract addresses
const PAGE_TOKEN_ADDRESS = '0xc4730f86d1f86ce0712a7b17ee919db7defad7fe' as const;
const LP_CONTRACT_ADDRESS = '0x7989DD74dF816A32EE0DaC0f3f8e24d740fc5cB2' as const;

// ABIs
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

const UNISWAP_V2_PAIR_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: 'reserve0', type: 'uint112' },
      { name: 'reserve1', type: 'uint112' },
      { name: 'blockTimestampLast', type: 'uint32' },
    ],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
] as const;

type GetReservesResult = [bigint, bigint, number];

const HomePage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [isUniswapModalOpen, setIsUniswapModalOpen] = useState(false);
  const [ethUsdPrice, setEthUsdPrice] = useState<number | null>(null);
  const [pagePrice, setPagePrice] = useState<number | null>(null);
  const [tvl, setTvl] = useState<number | null>(null);

  const { data: ethBalance } = useBalance({
    address,
  });

  const { data: pageBalanceData } = useContractRead({
    address: PAGE_TOKEN_ADDRESS as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  }) as { data: bigint | undefined };

  const { data: pageDecimals } = useContractRead({
    address: PAGE_TOKEN_ADDRESS as Address,
    abi: ERC20_ABI,
    functionName: 'decimals',
  }) as { data: number | undefined };

  const { data: lpReserves } = useContractRead({
    address: LP_CONTRACT_ADDRESS as Address,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'getReserves',
  }) as { data: GetReservesResult | undefined };

  const { data: token0 } = useContractRead({
    address: LP_CONTRACT_ADDRESS as Address,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'token0',
  }) as { data: Address | undefined };

  const { data: token1 } = useContractRead({
    address: LP_CONTRACT_ADDRESS as Address,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'token1',
  }) as { data: Address | undefined };

  // Fetch ETH/USD price
  useEffect(() => {
    const fetchEthUsdPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const data = await response.json();
        setEthUsdPrice(data.ethereum.usd);
      } catch (error) {
        console.error('Failed to fetch ETH/USD price:', error);
      }
    };

    fetchEthUsdPrice();
  }, []);

  // Calculate prices and TVL
  useEffect(() => {
    if (lpReserves && token0 && token1 && ethUsdPrice && pageDecimals) {
      const isPageToken0 = token0.toLowerCase() === PAGE_TOKEN_ADDRESS.toLowerCase();
      
      const [reserve0, reserve1] = lpReserves;
      
      const ethReserve = isPageToken0
        ? Number(formatUnits(reserve1, 18))
        : Number(formatUnits(reserve0, 18));
      
      const pageReserve = isPageToken0
        ? Number(formatUnits(reserve0, Number(pageDecimals)))
        : Number(formatUnits(reserve1, Number(pageDecimals)));

      const pagePriceInUsd = (ethUsdPrice * ethReserve) / pageReserve;
      setPagePrice(pagePriceInUsd);

      const ethSideUsd = ethReserve * ethUsdPrice;
      const pageSideUsd = pageReserve * pagePriceInUsd;
      const totalTvlUsd = ethSideUsd + pageSideUsd;
      setTvl(totalTvlUsd);

      console.log({
        isPageToken0,
        ethReserve,
        pageReserve,
        ethUsdPrice,
        pagePriceInUsd,
        ethSideUsd,
        pageSideUsd,
        totalTvlUsd
      });
    }
  }, [lpReserves, token0, token1, ethUsdPrice, pageDecimals]);

  const pageBalance = pageBalanceData && pageDecimals
    ? Number(formatUnits(pageBalanceData, pageDecimals))
    : 0;

  const ethBalanceUsd = ethBalance && ethUsdPrice
    ? parseFloat(ethBalance.formatted) * ethUsdPrice
    : 0;

  const pageBalanceUsd = pagePrice !== null
    ? pageBalance * pagePrice
    : 0;

  return (
    <div className="p-4">
      {/* Prices Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Token Prices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">ETH Price</p>
            <p className="text-2xl font-bold">
              ${ethUsdPrice?.toFixed(2) ?? 'Loading...'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">$PAGE Price</p>
            <p className="text-2xl font-bold">
              ${pagePrice?.toFixed(6) ?? 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* TVL Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Total Value Locked (TVL)</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-2xl font-bold">
            ${tvl?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'Loading...'}
          </p>
        </div>
      </div>

      {/* Only show if connected */}
      {isConnected && (
        <>
          {/* Balances Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Your Balances</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-gray-600">ETH Balance</p>
                <p className="text-2xl font-bold">
                  {ethBalance ? `${parseFloat(ethBalance.formatted).toFixed(4)} ETH` : '0.0000 ETH'}
                </p>
                <p className="text-gray-600">
                  ${ethBalanceUsd.toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-gray-600">$PAGE Balance</p>
                <p className="text-2xl font-bold">
                  {pageBalance.toFixed(2)} $PAGE
                </p>
                <p className="text-gray-600">
                  ${pageBalanceUsd.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Liquidity Pool Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Liquidity Pool</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-gray-600">Provide liquidity and earn rewards.</p>
              <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => setIsUniswapModalOpen(true)}
              >
                Trade $PAGE
              </button>
            </div>
          </div>
        </>
      )}

      {/* Uniswap Modal */}
      <UniswapModal
        isOpen={isUniswapModalOpen}
        onClose={() => setIsUniswapModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;