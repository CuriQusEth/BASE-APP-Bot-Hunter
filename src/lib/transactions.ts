/**
 * Centralized Transaction Execution Service for the App.
 * 
 * This module exports hooks/utilities that automatically append the Base Builder
 * Code attribution to *any* transaction (game reward claims, simple transfers, etc.).
 */

import { useSendTransaction } from 'wagmi';
import { withBaseAttribution } from './base-attribution';
import { SendTransactionParameters } from 'wagmi/actions';
import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';

/**
 * Custom hook wrapping Wagmi's useSendTransaction, ensuring that all arbitrary 
 * transactions naturally carry the ERC-8021 attribution suffix.
 */
export function useAttributedTransaction() {
  const { sendTransaction, sendTransactionAsync, ...rest } = useSendTransaction();

  const sendAttributedTransaction = useCallback(
    (args: SendTransactionParameters, options?: any) => {
      const attributedData = withBaseAttribution(args.data);
      return sendTransaction({ ...args, data: attributedData }, options);
    },
    [sendTransaction]
  );

  const sendAttributedTransactionAsync = useCallback(
    async (args: SendTransactionParameters, options?: any) => {
      const attributedData = withBaseAttribution(args.data);
      return sendTransactionAsync({ ...args, data: attributedData }, options);
    },
    [sendTransactionAsync]
  );

  return {
    sendTransaction: sendAttributedTransaction,
    sendTransactionAsync: sendAttributedTransactionAsync,
    ...rest,
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
