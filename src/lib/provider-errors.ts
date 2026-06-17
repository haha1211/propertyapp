export type ProviderErrorCode = "CONFIGURATION" | "UNSUPPORTED_REGION" | "AUTH" | "RATE_LIMIT" | "NO_DATA" | "PARSE" | "NETWORK";

export class ProviderError extends Error {
  readonly code: ProviderErrorCode;
  readonly provider: string;
  readonly status?: number;

  constructor(provider: string, code: ProviderErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ProviderError";
    this.provider = provider;
    this.code = code;
    this.status = status;
  }
}

export function isProviderError(error: unknown): error is ProviderError {
  return error instanceof ProviderError;
}
