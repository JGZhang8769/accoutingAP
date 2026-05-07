import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Anomaly, AnomalyType } from '../../models/anomaly';

@Component({
  selector: 'app-anomalies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anomalies.component.html',
  styleUrls: ['./anomalies.component.scss']
})
export class AnomaliesComponent {
  @Input() anomalies: Anomaly[] = [];

  getAnomalyTypeName(type: AnomalyType): string {
    switch(type) {
      case AnomalyType.UnbalancedVoucher: return '借貸不平';
      case AnomalyType.DebitBalanceInAP: return '應付借餘';
      case AnomalyType.MissingData: return '資料缺失';
      default: return '未知異常';
    }
  }
}
