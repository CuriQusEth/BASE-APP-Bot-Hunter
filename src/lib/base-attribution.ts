/**
 * Base ERC-8021 Attribution core implementation.
 * 
 * Why ERC-8021 is required:
 * ERC-8021 is the standard for attaching attribution to on-chain actions without
 * breaking standard EVM logic. Base relies on this to track application origin 
 * metrics (e.g. to distribute protocol rewards and analytics).
 * 
 * How Builder Codes work:
 * The Builder Code is string-encoded to hex, combined with its length, schema ID (0x00),
 * and a strict 16-byte marker (0x8021...8021) to form the suffix.
 * 
 * How Base attribution is preserved:
 * When this suffix is appended to the calldata of any standard contract call or transfer,
 * EVM smart contracts natively ignore extra payload bytes, but Base's indexer 
 * identifies the marker and attributes the tx gas/value activity to the Builder.
 */

import { stringToHex, toHex, concatHex } from 'viem';
import { getBuilderCode } from './builder-code';

export const ERC8021_MARKER = '80218021802180218021802180218021';
export const SCHEMA_ID_BUILDER = '0x00'; // Schema 0x00 specifies Builder Code format

/**
 * Generates the pure ERC-8021 suffix byte sequence for the current builder code.
 */
export function generateAttributionSuffix(): `0x${string}` {
  const code = getBuilderCode();
  
  // 1. Encode payload to hex
  const payloadHex = stringToHex(code);
  
  // 2. Length of payload in bytes
  const lengthByte = toHex(code.length, { size: 1 });
  
  // 3. Combine: Payload + Length + SchemaID + Marker
  return concatHex([
    payloadHex,
    lengthByte,
    SCHEMA_ID_BUILDER,
    `0x${ERC8021_MARKER}`
  ]);
}

/**
 * Appends the ERC-8021 attribution suffix to existing calldata.
 * Use this to wrap standard transaction data payloads.
 */
export function withBaseAttribution(data: `0x${string}` = '0x'): `0x${string}` {
  const suffix = generateAttributionSuffix();
  return concatHex([data, suffix]);
}
