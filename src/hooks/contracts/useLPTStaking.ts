import { useContractRead, useContractWrite } from 'wagmi';
import { LPT_STAKING_ABI } from '../config/abis';
import { LPT_STAKING_ADDRESS } from '../config/addresses';

export function useLPTStaking() {
  const { data: stakedBalance } = useContractRead({
    address: LPT_STAKING_ADDRESS,
    abi: LPT_STAKING_ABI,
    functionName: 'balanceOf',
  });

  const { data: rewards } = useContractRead({
    address: LPT_STAKING_ADDRESS,
    abi: LPT_STAKING_ABI,
    functionName: 'earned',
  });

  const { writeAsync: stake } = useContractWrite({
    address: LPT_STAKING_ADDRESS,
    abi: LPT_STAKING_ABI,
    functionName: 'stake',
  });

  return { stakedBalance, rewards, stake };
}
