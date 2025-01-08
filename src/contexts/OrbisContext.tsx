import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useWalletClient, useAccount, usePublicClient } from 'wagmi';
import { Orbis } from '@orbisclub/orbis-sdk';
import type { RpcTransactionRequest } from 'viem';

const orbis = new Orbis();

interface OrbisContextType {
  orbisInstance: typeof orbis | null;
  userDid: string | null;
  isConnected: boolean;
  connectOrbis: () => Promise<void>;
}

type WalletMethod = 
  | 'eth_requestAccounts'
  | 'eth_accounts'
  | 'eth_chainId'
  | 'eth_estimateGas'
  | 'eth_sendRawTransaction'
  | 'eth_sign'
  | 'personal_sign';

const OrbisContext = createContext<OrbisContextType | null>(null);

export const OrbisProvider = ({ children }: { children: React.ReactNode }) => {
  const [orbisInstance, setOrbisInstance] = useState<typeof orbis | null>(null);
  const [userDid, setUserDid] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectionAttemptRef = useRef(false);

  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  useEffect(() => {
    setOrbisInstance(orbis);
  }, []);

  const connectOrbis = async () => {
    if (!orbisInstance || !walletClient || !publicClient || !address || 
        isConnected || connectionAttemptRef.current) return;

    connectionAttemptRef.current = true;

    try {
      const provider = {
        provider: publicClient,
        account: address,
        enable: async () => {
          return [address];
        },
        request: async ({ method, params = [] }: { method: WalletMethod; params?: unknown[] }) => {
          if (method === 'eth_requestAccounts') {
            return [address];
          }
          // Safe type assertion since we know these methods are valid
          return await walletClient.request({
            method: method as any,
            params: params as any
          });
        }
      };

      const res = await orbisInstance.connect(provider, true);
      if (res.status === 200) {
        setUserDid(res.did);
        setIsConnected(true);
        console.log('Connected to Orbis with DID:', res.did);
      } else {
        console.error('Error connecting to Orbis:', res);
      }
    } catch (error) {
      console.error('Error in connectOrbis:', error);
    } finally {
      connectionAttemptRef.current = false;
    }
  };

  return (
    <OrbisContext.Provider value={{ orbisInstance, userDid, isConnected, connectOrbis }}>
      {children}
    </OrbisContext.Provider>
  );
};

export const useOrbis = () => {
  const context = useContext(OrbisContext);
  if (!context) {
    throw new Error('useOrbis must be used within an OrbisProvider');
  }
  return context;
};