import { AccountType } from "@/lib/enums/account.enum";

function isAccountType(v: any): v is AccountType {
  return Object.values(AccountType).includes(v as AccountType);
}

/**
 * Optionally set a default type via env (e.g., BANK_ACCOUNT / CRYPTO_WALLET / MOBILE_PAYMENT).
 * If invalid or unset, we fall back to undefined (i.e., show all when not provided).
 */
const raw = process.env.NEXT_PUBLIC_DEFAULT_PAYMENT_METHOD_TYPE;
export const DEFAULT_PAYMENT_METHOD_TYPE: AccountType | undefined =
  raw && isAccountType(raw) ? (raw as AccountType) : undefined;

export { isAccountType };
