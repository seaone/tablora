/**
 * Shared application configuration and constants.
 */
export * from "./labels";

export const APP_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
} as const;
