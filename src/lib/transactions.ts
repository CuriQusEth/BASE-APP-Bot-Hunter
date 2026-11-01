/**
 * Centralized Transaction Execution Service for the App.
 * 
 * This module exports hooks/utilities that automatically append the Base Builder
 * Code attribution to *any* transaction (game reward claims, simple transfers, etc.).
 */

import { useSendTransaction, useSendCalls, useChainId } from 'wagmi';
import { withBaseAttribution, generateAttributionSuffix } from './base-attribution';
import { SendTransactionParameters } from 'wagmi/actions';
import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { useWalletCapabilities } from '../hooks/useWalletCapabilities';

// Canonical Multicall3 contract deployed at the same address across Base Mainnet and Base Sepolia
export const CANONICAL_MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;

/**
 * Custom hook wrapping Wagmi's useSendTransaction and useSendCalls, ensuring that all 
 * transactions naturally carry the ERC-8021 attribution suffix on Base.
 */
export function useAttributedTransaction() {
  const chainId = useChainId();
  const { supportsBatching } = useWalletCapabilities(chainId);
  const { sendTransaction, sendTransactionAsync, ...txRest } = useSendTransaction();
  const { sendCalls, sendCallsAsync, ...callsRest } = useSendCalls();

  const sendAttributedTransaction = useCallback(
    (args: SendTransactionParameters, options?: any) => {
      const target = args.to || CANONICAL_MULTICALL3;
      const attributedData = withBaseAttribution(args.data);
      return sendTransaction({ ...args, to: target, data: attributedData }, options);
    },
    [sendTransaction]
  );

  const sendAttributedTransactionAsync = useCallback(
    async (args: SendTransactionParameters, options?: any) => {
      const target = args.to || CANONICAL_MULTICALL3;
      const attributedData = withBaseAttribution(args.data);
      return sendTransactionAsync({ ...args, to: target, data: attributedData }, options);
    },
    [sendTransactionAsync]
  );

  /**
   * Smart Wallet batch call execution with EIP-5792 and ERC-8021 DataSuffix capability
   */
  const sendAttributedBatchCalls = useCallback(
    async (calls: Array<{ to: `0x${string}`; data?: `0x${string}`; value?: bigint }>) => {
      const suffix = generateAttributionSuffix();
      return sendCallsAsync({
        calls,
        chainId,
        capabilities: {
          dataSuffix: {
            value: suffix,
            optional: true,
          },
        },
      } as any);
    },
    [sendCallsAsync, chainId]
  );

  return {
    sendTransaction: sendAttributedTransaction,
    sendTransactionAsync: sendAttributedTransactionAsync,
    sendCalls: sendAttributedBatchCalls,
    supportsBatching,
    ...txRest,
  };
}


/**
 * Utility for appending attribution to wagmi's `useWriteContract` args when possible
 * Note: standard `writeContract` abi encodings happen internal to viem, so to safely
 * append attribution, you bypass `writeContract` and instead encode the ABI data yourself,
 * append the attribution string, then route it via `sendTransaction`.
 */
export function prepareAttributedContractData(abi: any, functionName: string, args: any[]): `0x${string}` {
  const data = encodeFunctionData({ abi, functionName, args });
  return withBaseAttribution(data);
}
