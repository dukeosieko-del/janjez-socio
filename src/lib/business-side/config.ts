export function getBusinessSideApiKey(): string | undefined {
  return process.env.BUSINESS_SIDE_API_KEY;
}

export function getBusinessSideHmacSecret(): string | undefined {
  return process.env.BUSINESS_SIDE_HMAC_SECRET || process.env.JANJEZ_MAIN_API_SECRET;
}

export function getBusinessSideAccountId(): string | undefined {
  return process.env.BUSINESS_SIDE_ACCOUNT_ID;
}
