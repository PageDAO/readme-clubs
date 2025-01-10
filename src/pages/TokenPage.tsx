import React, { useState } from 'react';
import { useAccount, useBalance, useReadContract, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import UniswapModal from '../features/web3/UniswapModal';
import { PAGE_TOKEN_ADDRESSES, LP_ADDRESSES, CONTRACTS } from '../config/contracts';

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

const LPTStakingABI = [
  {
    constant: true,
    inputs: [{ name: 'user', type: 'address' }],
    name: 'stakes',
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'lastRewardClaim', type: 'uint256' },
    ],
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'stake',
    outputs: [],
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'unstake',
    outputs: [],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getRewards',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
] as const;

type GetReservesResult = [bigint, bigint, number];

const TokenPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isUniswapModalOpen, setIsUniswapModalOpen] = useState(false);
  const [ethUsdPrice, setEthUsdPrice] = useState<number | null>(null);
  const [pagePrice, setPagePrice] = useState<number | null>(null);
  const [tvl, setTvl] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [unstakeAmount, setUnstakeAmount] = useState<string>('');

  const pageTokenAddress = PAGE_TOKEN_ADDRESSES[chainId] as Address;
  const lpContractAddress = LP_ADDRESSES[chainId] as Address;
  const lptStakingAddress = CONTRACTS.LPT_STAKING as Address;

  // Fetch ETH balance
  const { data: ethBalance } = useBalance({
    address,
  });

  // Fetch PAGE token balance
  const { data: pageBalanceData } = useReadContract({
    address: pageTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
  }) as { data: bigint | undefined };

  const { data: pageDecimals } = useReadContract({
    address: pageTokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  }) as { data: number | undefined };

  // Fetch LP reserves
  const { data: lpReserves } = useReadContract({
    address: lpContractAddress,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'getReserves',
  }) as { data: GetReservesResult | undefined };

  const { data: token0 } = useReadContract({
    address: lpContractAddress,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'token0',
  }) as { data: Address | undefined };

  const { data: token1 } = useReadContract({
    address: lpContractAddress,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'token1',
  }) as { data: Address | undefined };

  // Fetch LP token balance
  const { data: lpTokenBalanceData } = useReadContract({
    address: lpContractAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
  }) as { data: bigint | undefined };

  const { data: lpTokenDecimals } = useReadContract({
    address: lpContractAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  }) as { data: number | undefined };

  // Fetch staked balance
  console.log('Fetching staked balance for address:', address);
  console.log('Staking contract address:', lptStakingAddress);
  console.log('ABI:', LPTStakingABI);

  const { data: stakedBalanceData, error: stakedBalanceError } = useReadContract({
    address: lptStakingAddress,
    abi: LPTStakingABI,
    functionName: 'stakes',
    args: [address!],
  }) as { data: [bigint, bigint, bigint] | undefined; error: Error | undefined };

  if (stakedBalanceError) {
    console.error('Error fetching staked balance:', stakedBalanceError);
  }

  console.log('Staked Balance Data:', stakedBalanceData);

  // Extract the staked amount from the array
  const stakedBalance = stakedBalanceData && lpTokenDecimals
    ? Number(formatUnits(stakedBalanceData[0], lpTokenDecimals)) // stakedBalanceData[0] is the amount
    : 0;

  // Fetch staking rewards
  const { data: rewards } = useReadContract({
    address: lptStakingAddress,
    abi: LPTStakingABI,
    functionName: 'getRewards',
    args: [address!],
  }) as { data: bigint | undefined };

  // Staking functionality
  const { writeContract: stake, isPending: isStaking } = useWriteContract();
  const { writeContract: unstake, isPending: isUnstaking } = useWriteContract();

  const handleStake = async () => {
    if (!stakeAmount || Number(stakeAmount) > lpTokenBalance) {
      alert('Invalid stake amount');
      return;
    }

    // Convert decimal input to integer
    const lpTokenDecimalsValue = lpTokenDecimals ?? 18;
    const stakeAmountWei = BigInt(Math.floor(Number(stakeAmount) * 10 ** lpTokenDecimalsValue));

    stake({
      address: lptStakingAddress,
      abi: LPTStakingABI,
      functionName: 'stake',
      args: [stakeAmountWei],
    });
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || Number(unstakeAmount) > stakedBalance) {
      alert('Invalid unstake amount');
      return;
    }

    // Convert decimal input to integer
    const lpTokenDecimalsValue = lpTokenDecimals ?? 18;
    const unstakeAmountWei = BigInt(Math.floor(Number(unstakeAmount) * 10 ** lpTokenDecimalsValue));

    unstake({
      address: lptStakingAddress,
      abi: LPTStakingABI,
      functionName: 'unstake',
      args: [unstakeAmountWei],
    });
  };

  // Fetch ETH/USD price
  const fetchEthUsdPrice = async () => {
    try {
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        )}`
      );
      const data = await response.json();
      const ethPrice = JSON.parse(data.contents).ethereum.usd;
      setEthUsdPrice(ethPrice);
    } catch (error) {
      console.error('Failed to fetch ETH/USD price:', error);
    }
  };

  // Calculate prices and TVL
  React.useEffect(() => {
    if (lpReserves && token0 && token1 && ethUsdPrice && pageDecimals) {
      const isPageToken0 = token0.toLowerCase() === pageTokenAddress.toLowerCase();
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

  const lpTokenBalance = lpTokenBalanceData && lpTokenDecimals
    ? Number(formatUnits(lpTokenBalanceData, lpTokenDecimals))
    : 0;

  const uniswapUrl = `https://app.uniswap.org/swap?chain=base&outputCurrency=${pageTokenAddress}&inputCurrency=ETH`;

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

          {/* Staking Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Staking</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-gray-600">Stake your LP tokens to earn rewards.</p>

              {/* Display LP Token Balance */}
              <div className="mt-4">
                <p className="text-gray-600">Your LP Token Balance:</p>
                <p className="text-2xl font-bold">
                  {lpTokenBalance.toFixed(4)} LP
                </p>
              </div>

              {/* Display Staked Balance */}
              <div className="mt-4">
                <p className="text-gray-600">Your Staked Balance:</p>
                <p className="text-2xl font-bold">
                  {stakedBalance.toFixed(4)} LP
                </p>
              </div>

              {/* Stake Input and Button */}
              <div className="flex gap-2 mt-4">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setStakeAmount(value);
                    }
                  }}
                  placeholder="Amount to stake"
                  className="p-2 border rounded flex-grow"
                  min="0"
                  step="0.0001"
                />
                <button
                  onClick={() => setStakeAmount(lpTokenBalance.toFixed(lpTokenDecimals ?? 18))}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Max
                </button>
              </div>
              <button
                onClick={handleStake}
                disabled={isStaking}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
              >
                {isStaking ? 'Staking...' : 'Stake'}
              </button>

              {/* Unstake Input and Button */}
              <div className="flex gap-2 mt-4">
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setUnstakeAmount(value);
                    }
                  }}
                  placeholder="Amount to unstake"
                  className="p-2 border rounded flex-grow"
                  min="0"
                  step="0.0001"
                />
                <button
                  onClick={() => setUnstakeAmount(stakedBalance.toFixed(lpTokenDecimals ?? 18))}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Max
                </button>
              </div>
              <button
                onClick={handleUnstake}
                disabled={isUnstaking}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
              >
                {isUnstaking ? 'Unstaking...' : 'Unstake'}
              </button>

              {/* Display Rewards */}
              <p className="mt-4 text-gray-600">
                Rewards: {rewards ? formatUnits(rewards, 18) : '0'} $PAGE
              </p>
            </div>
          </div>

          {/* Liquidity Pool Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Liquidity Pool</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-gray-600">Provide liquidity and earn rewards.</p>
              <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setIsUniswapModalOpen(true)}
              >
                Trade $PAGE
              </button>
              <button
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => window.open(uniswapUrl, '_blank')}
              >
                Go to Uniswap
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

export default TokenPage;