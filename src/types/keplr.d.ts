// src/types/keplr.d.ts
declare global {
  interface Window {
    keplr?: {
      enable: (chainId: string) => Promise<void>;
      getOfflineSigner: (chainId: string) => {
        getAccounts: () => Promise<Array<{ address: string; pubkey: Uint8Array }>>;
      };
      getKey: (chainId: string) => Promise<{
        name: string;
        algo: string;
        pubKey: Uint8Array;
        address: Uint8Array;
        bech32Address: string;
      }>;
    };
  }
}

export {};