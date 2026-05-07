export interface AccountBalance {
    accountCode: string;
    accountName: string;
    vendor: string;
    currency: string;
    balance: number; // For AP, credit is positive, debit is negative (balance = credit - debit)
    baseCurrencyBalance: number; // Balance converted to base currency
}
