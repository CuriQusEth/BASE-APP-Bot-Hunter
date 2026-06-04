/**
 * ERC-8021 Transaction Attribution Utilities
 *
 * This protocol allows developers and applications to append standard
 * attribution data to transaction call data, or handle it via smart contracts.
 */

export const ATTRIBUTION_CODE = "[ATTRIBUTION_CODE]";
export const BUILDER_CODE = "bc_9b19fklw"; // Added as requested

/**
 * Appends ERC-8021 builder attribution to standard transaction data.
 * Useful when interacting with contracts that support extracting this data,
 * or simply establishing a chain footprint.
 */
export function appendAttribution(data: string = "0x"): string {
  // Simplistic placeholder for appending attribution hex data
  // In a real implementation, this encodes the builder and app IDs.
  const hexBuilder = Buffer.from(BUILDER_CODE).toString('hex');
  return `${data}${data === "0x" ? "" : "00"}${hexBuilder}`;
}
