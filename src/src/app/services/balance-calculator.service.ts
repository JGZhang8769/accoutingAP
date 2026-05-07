import { Injectable } from '@angular/core';
import { Voucher } from '../models/voucher';
import { AccountBalance } from '../models/account-balance';

@Injectable({
  providedIn: 'root'
})
export class BalanceCalculatorService {

  constructor() { }

  calculateBalances(vouchers: Voucher[]): AccountBalance[] {
    const balanceMap = new Map<string, AccountBalance>();

    for (const v of vouchers) {
      const isLiability = v.accountCode.startsWith('2') || v.accountName?.includes('應付') || v.accountName?.includes('負債');
      // For liability/AP, credit increases balance, debit decreases.
      // For assets, debit increases, credit decreases.
      // To keep it generic but focused on AP, we'll default to standard accounting rules if prefix 1 vs 2.
      // Assuming 1 = Asset, 2 = Liability, 3 = Equity, 4 = Revenue, 5 = Expense

      const isDebitNormal = v.accountCode.startsWith('1') || v.accountCode.startsWith('5');
      const netAmount = isDebitNormal ? (v.debit - v.credit) : (v.credit - v.debit);
      const baseNetAmount = isDebitNormal ? ((v.debit - v.credit) * v.exchangeRate) : ((v.credit - v.debit) * v.exchangeRate);

      const key = `${v.accountCode}-${v.vendor}-${v.currency}`;

      if (!balanceMap.has(key)) {
        balanceMap.set(key, {
          accountCode: v.accountCode,
          accountName: v.accountName || '',
          vendor: v.vendor,
          currency: v.currency,
          balance: 0,
          baseCurrencyBalance: 0
        });
      }

      const balanceRecord = balanceMap.get(key)!;
      balanceRecord.balance += netAmount;
      balanceRecord.baseCurrencyBalance += baseNetAmount;
      if (!balanceRecord.accountName && v.accountName) {
         balanceRecord.accountName = v.accountName;
      }
    }

    return Array.from(balanceMap.values());
  }
}
