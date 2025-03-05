import { useMemo } from 'react';
import { useIBCToken } from '../../providers/IBCTokenProvider';
import { COSMOS_PAGE_TOKEN } from '../../config/tokenConfig';

export function useIBCPage() {
  const ibcTokenData = useIBCToken();
  const osmosisChainId = 'osmosis-1';
  const osmosisData = ibcTokenData.chains[osmosisChainId];

  // Use a clean memoized API for osmosis data
  const osmosis = useMemo(() => ({
    // Chain data
    chainId: osmosisChainId,
    name: osmosisData?.name || 'Osmosis',
    
    // Token data
    price: osmosisData?.price,
    marketCap: osmosisData?.marketCap,
    volume24h: osmosisData?.volume24h,
    tvl: osmosisData?.tvl,
    
    // Token supply data
    supply: osmosisData?.tokenInfo?.supply,
    
    // User data
    balance: osmosisData?.balance || 0,
    isConnected: ibcTokenData.isKeplrConnected,
    
    // Pool data
    poolData: osmosisData?.poolData,
    
    // Status
    loading: osmosisData?.loading || false,
    error: osmosisData?.error,
    lastUpdated: osmosisData?.lastUpdated,
    
    // Connection control
    connect: ibcTokenData.connectKeplr,
    disconnect: ibcTokenData.disconnectKeplr,
    isKeplrAvailable: ibcTokenData.isKeplrAvailable,
    
    // Config
    tokenConfig: COSMOS_PAGE_TOKEN,
    refreshData: () => ibcTokenData.refreshChainData(osmosisChainId)
  }), [
    osmosisChainId,
    osmosisData,
    ibcTokenData.isKeplrConnected,
    ibcTokenData.isKeplrAvailable,
    ibcTokenData.connectKeplr,
    ibcTokenData.disconnectKeplr,
    ibcTokenData.refreshChainData
  ]);

  return { osmosis };
}
