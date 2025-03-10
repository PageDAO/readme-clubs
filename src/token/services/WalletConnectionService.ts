import { useState, useEffect, useCallback } from 'react';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
}

export class KeplrWalletService {
  async connect(chainId = 'osmosis-1'): Promise<string | null> {
    if (!window.keplr) {
      throw new Error('Keplr wallet not found');
    }
    
    try {
      await window.keplr.enable(chainId);
      const key = await window.keplr.getKey(chainId);
      return key.bech32Address;
    } catch (error) {
      console.error('Error connecting to Keplr:', error);
      throw error;
    }
  }
  
  async disconnect(): Promise<void> {
    // Keplr doesn't have a disconnect method, so we just clear our local state
    return Promise.resolve();
  }
  
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.keplr;
  }
}

// Export a singleton instance
export const keplrWalletService = new KeplrWalletService();
