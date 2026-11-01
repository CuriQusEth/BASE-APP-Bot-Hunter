import { useCapabilities } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { useMemo } from 'react';

/**
 * Detects wallet capabilities per EIP-5792 on Base.
 * Smart wallets support batch transactions (atomic) and dataSuffix capabilities.
 * EOAs do not, so we fall back gracefully to standard transactions.
 */
export function useWalletCapabilities(targetChainId?: number) {
  const { data: capabilities } = useCapabilities();
  const chainId = targetChainId || base.id;

  const supportsBatching = useMemo(() => {
    const atomic = capabilities?.[chainId]?.atomic;
    return atomic?.status === 'ready' || atomic?.status === 'supported';
  }, [capabilities, chainId]);

  const supportsPaymaster = useMemo(() => {
    return capabilities?.[chainId]?.paymasterService?.supported === true;
  }, [capabilities, chainId]);

  const supportsDataSuffix = useMemo(() => {
    return (capabilities?.[chainId] as any)?.dataSuffix?.supported === true;
  }, [capabilities, chainId]);

  return { 
    capabilities, 
    supportsBatching, 
    supportsPaymaster, 
    supportsDataSuffix,
    chainId 
  };
}
