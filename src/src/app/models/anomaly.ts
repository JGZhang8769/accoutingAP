export enum AnomalyType {
    UnbalancedVoucher = 'UnbalancedVoucher',
    DebitBalanceInAP = 'DebitBalanceInAP',
    MissingData = 'MissingData'
}

export interface Anomaly {
    type: AnomalyType;
    message: string;
    voucherNo?: string;
    rowNumber?: number;
}
