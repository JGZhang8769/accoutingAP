export interface Voucher {
    voucherNo: string;
    date: Date;
    accountCode: string;
    accountName?: string;
    vendor: string;
    debit: number;
    credit: number;
    currency: string;
    exchangeRate: number;
    originalRow: number;
}
