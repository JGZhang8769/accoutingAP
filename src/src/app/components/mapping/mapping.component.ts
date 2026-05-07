import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldMapping } from '../../services/mapping.service';

@Component({
  selector: 'app-mapping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss']
})
export class MappingComponent {
  @Input() fileHeaders: string[] = [];
  @Output() mappingConfirmed = new EventEmitter<FieldMapping>();
  @Output() cancel = new EventEmitter<void>();

  requiredFields = [
    { key: 'voucherNo' as keyof FieldMapping, label: '憑證號碼 (Voucher No)' },
    { key: 'date' as keyof FieldMapping, label: '憑證日期 (Date)' },
    { key: 'accountCode' as keyof FieldMapping, label: '會計科目代碼 (Account Code)' },
    { key: 'accountName' as keyof FieldMapping, label: '會計科目名稱 (Account Name)' },
    { key: 'vendor' as keyof FieldMapping, label: '供應商 (Vendor)' },
    { key: 'debit' as keyof FieldMapping, label: '借方金額 (Debit)' },
    { key: 'credit' as keyof FieldMapping, label: '貸方金額 (Credit)' },
    { key: 'currency' as keyof FieldMapping, label: '幣別 (Currency)' },
    { key: 'exchangeRate' as keyof FieldMapping, label: '匯率 (Exchange Rate)' }
  ];

  mapping: FieldMapping = {
    voucherNo: '',
    date: '',
    accountCode: '',
    accountName: '',
    vendor: '',
    debit: '',
    credit: '',
    currency: '',
    exchangeRate: ''
  };

  ngOnChanges() {
    // Basic auto-mapping logic if headers match closely
    const lowerHeaders = this.fileHeaders.map(h => h.toLowerCase());

    const autoMap = (key: keyof FieldMapping, searchTerms: string[]) => {
      for (const term of searchTerms) {
        const idx = lowerHeaders.findIndex(h => h.includes(term));
        if (idx !== -1) {
          this.mapping[key] = this.fileHeaders[idx];
          break;
        }
      }
    };

    autoMap('voucherNo', ['憑證', 'voucher', 'no', '號']);
    autoMap('date', ['日期', 'date']);
    autoMap('accountCode', ['科目代碼', 'account code', '科目']);
    autoMap('accountName', ['科目名稱', 'account name']);
    autoMap('vendor', ['供應商', 'vendor', '廠商']);
    autoMap('debit', ['借', 'debit']);
    autoMap('credit', ['貸', 'credit']);
    autoMap('currency', ['幣別', 'currency']);
    autoMap('exchangeRate', ['匯率', 'rate']);
  }

  confirmMapping() {
    this.mappingConfirmed.emit(this.mapping);
  }
}
