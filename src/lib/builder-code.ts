/**
 * Builder Code Configuration
 * 
 * Central configuration file for Base Builder Code implementation.
 * It resolves the builder code from environment variables with a fallback.
 */

// Fallback to exactly what the user provided if the env var isn't set
export const FALLBACK_BUILDER_CODE = "bc_9b19fklw";

/**
 * Returns the current active builder code for the app.
 * Resolves from VITE_BASE_BUILDER_CODE or falls back to literal.
 */
export function getBuilderCode(): string {
  // Use import.meta.env for Vite clients
  return (import.meta as any).env?.VITE_BASE_BUILDER_CODE || FALLBACK_BUILDER_CODE;
}
