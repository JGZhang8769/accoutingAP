import { Injectable } from '@angular/core';
import { Voucher } from '../models/voucher';
import { Anomaly, AnomalyType } from '../models/anomaly';

export interface IValidationRule {
  validate(vouchers: Voucher[]): Anomaly[];
}

export class UnbalancedVoucherRule implements IValidationRule {
  validate(vouchers: Voucher[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const vouchersMap = new Map<string, { debit: number; credit: number; rows: number[] }>();

    for (const v of vouchers) {
      if (!v.voucherNo) continue;
      if (!vouchersMap.has(v.voucherNo)) {
        vouchersMap.set(v.voucherNo, { debit: 0, credit: 0, rows: [] });
      }
      const agg = vouchersMap.get(v.voucherNo)!;
      // Convert to base currency for voucher balance check if applicable,
      // or just assume same currency within voucher.
      // Simplified: check base amount.
      agg.debit += v.debit * v.exchangeRate;
      agg.credit += v.credit * v.exchangeRate;
      agg.rows.push(v.originalRow);
    }

    for (const [voucherNo, agg] of vouchersMap.entries()) {
      // Allow small floating point differences
      if (Math.abs(agg.debit - agg.credit) > 0.01) {
        anomalies.push({
          type: AnomalyType.UnbalancedVoucher,
          message: `憑證 ${voucherNo} 借貸不平 (借: ${agg.debit.toFixed(2)}, 貸: ${agg.credit.toFixed(2)})`,
          voucherNo: voucherNo
        });
      }
    }

    return anomalies;
  }
}

export class MissingDataRule implements IValidationRule {
  validate(vouchers: Voucher[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    for (const v of vouchers) {
      if (!v.accountCode) {
        anomalies.push({
          type: AnomalyType.MissingData,
          message: `第 ${v.originalRow} 列缺少會計科目`,
          rowNumber: v.originalRow
        });
      }
      if (!v.vendor && v.accountCode.startsWith('214')) { // Example logic: AP starts with 214
        anomalies.push({
          type: AnomalyType.MissingData,
          message: `第 ${v.originalRow} 列應付科目缺少供應商`,
          rowNumber: v.originalRow
        });
      }
    }
    return anomalies;
  }
}

export class DebitBalanceInAPRule implements IValidationRule {
  validate(vouchers: Voucher[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    // Aggregate by vendor + account
    const balanceMap = new Map<string, number>();

    for (const v of vouchers) {
      if (v.accountCode.startsWith('214') || v.accountName?.includes('應付')) {
        const key = `${v.vendor}-${v.accountCode}`;
        const current = balanceMap.get(key) || 0;
        // AP balance = Credit - Debit
        balanceMap.set(key, current + (v.credit - v.debit));
      }
    }

    for (const [key, balance] of balanceMap.entries()) {
      if (balance < -0.01) { // Floating point safeguard
        const [vendor, accountCode] = key.split('-');
        anomalies.push({
          type: AnomalyType.DebitBalanceInAP,
          message: `供應商 ${vendor} 於科目 ${accountCode} 出現借方餘額 (可能溢付或重複沖銷): ${balance.toFixed(2)}`
        });
      }
    }

    return anomalies;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private rules: IValidationRule[] = [
    new UnbalancedVoucherRule(),
    new MissingDataRule(),
    new DebitBalanceInAPRule()
  ];

  constructor() { }

  validate(vouchers: Voucher[]): Anomaly[] {
    let allAnomalies: Anomaly[] = [];
    for (const rule of this.rules) {
      allAnomalies = allAnomalies.concat(rule.validate(vouchers));
    }
    return allAnomalies;
  }
}
