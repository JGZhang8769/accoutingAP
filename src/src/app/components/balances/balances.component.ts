import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AccountBalance } from '../../models/account-balance';

@Component({
  selector: 'app-balances',
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe],
  templateUrl: './balances.component.html',
  styleUrls: ['./balances.component.scss']
})
export class BalancesComponent {
  @Input() balances: AccountBalance[] = [];

  exportCSV() {
    if (this.balances.length === 0) return;

    const headers = ['科目代碼', '科目名稱', '供應商', '幣別', '原幣餘額', '本位幣餘額'];
    const csvContent = [
      headers.join(','),
      ...this.balances.map(b =>
        `"${b.accountCode}","${b.accountName}","${b.vendor}","${b.currency}",${b.balance},${b.baseCurrencyBalance}`
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `科目餘額表_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
