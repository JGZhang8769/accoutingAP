import { Injectable } from '@angular/core';
import { Voucher } from '../models/voucher';
import { RawRecord } from '../models/raw-record';

export interface FieldMapping {
  voucherNo: string;
  date: string;
  accountCode: string;
  accountName: string;
  vendor: string;
  debit: string;
  credit: string;
  currency: string;
  exchangeRate: string;
}

@Injectable({
  providedIn: 'root'
})
export class MappingService {

  constructor() { }

  getHeaders(data: any[]): string[] {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }

  mapRecords(rawRecords: any[], mapping: FieldMapping): Voucher[] {
    return rawRecords.map((record, index) => {
      return {
        voucherNo: record[mapping.voucherNo] || '',
        date: new Date(record[mapping.date] || new Date()),
        accountCode: record[mapping.accountCode] || '',
        accountName: record[mapping.accountName] || '',
        vendor: record[mapping.vendor] || '',
        debit: this.parseAmount(record[mapping.debit]),
        credit: this.parseAmount(record[mapping.credit]),
        currency: record[mapping.currency] || 'TWD',
        exchangeRate: this.parseAmount(record[mapping.exchangeRate]) || 1,
        originalRow: index + 2 // Assuming header is row 1
      };
    });
  }

  private parseAmount(value: any): number {
    if (value === undefined || value === null || value === '') return 0;
    const parsed = Number(value.toString().replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
}
