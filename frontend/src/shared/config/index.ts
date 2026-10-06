/**
 * Shared application configuration and constants.
 */
export const APP_CONFIG = {
  name: "Таблора",
  shortName: "Tablora",
  description: "Real-time competition results table web application",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  logoUrl:
    "https://lh3.googleusercontent.com/aida/AEtjO1Vp6ECyaJgVOf3jTr9NK9oGsgHTALS_baA0g79A3xjvoQs-XAhXQHwAPnGLdx0jdovKb9rdz_icIatGhV2LZmbYgm63P9Z0ubF5qcIqbCPGBNsFjQFhY-wR0O_RubyuHKwEHj0wypu_QbD8CGhcIwDwWh7MiOf6tOrUILEGEkoE0EV453wYCefGDAawxcy5tIyRMr52Z1P4Gi18t0DIPFxvVDoGb888TG85f3SAzKh1h8uGjCgSkGoeH6w",
} as const;
