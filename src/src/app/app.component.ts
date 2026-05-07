import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './components/upload/upload.component';
import { MappingComponent } from './components/mapping/mapping.component';
import { AnomaliesComponent } from './components/anomalies/anomalies.component';
import { BalancesComponent } from './components/balances/balances.component';
import { ScannerComponent } from './components/scanner/scanner.component';

import { FileParserService } from './services/file-parser.service';
import { MappingService, FieldMapping } from './services/mapping.service';
import { ValidationService } from './services/validation.service';
import { BalanceCalculatorService } from './services/balance-calculator.service';

import { Voucher } from './models/voucher';
import { Anomaly } from './models/anomaly';
import { AccountBalance } from './models/account-balance';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    UploadComponent,
    MappingComponent,
    AnomaliesComponent,
    BalancesComponent,
    ScannerComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  step: number = 1;
  activeTab: 'anomalies' | 'balances' | 'scanner' = 'anomalies';

  rawRecords: any[] = [];
  fileHeaders: string[] = [];

  vouchers: Voucher[] = [];
  anomalies: Anomaly[] = [];
  balances: AccountBalance[] = [];

  constructor(
    private fileParser: FileParserService,
    private mappingService: MappingService,
    private validationService: ValidationService,
    private balanceCalculator: BalanceCalculatorService
  ) {}

  async onFileLoaded(file: File) {
    try {
      this.rawRecords = await this.fileParser.parseFile(file);
      this.fileHeaders = this.mappingService.getHeaders(this.rawRecords);
      if (this.fileHeaders.length === 0) {
        alert('檔案似乎是空的或無效的格式！');
        return;
      }
      this.step = 2;
    } catch (error) {
      console.error(error);
      alert('解析檔案失敗，請確定檔案格式正確。');
    }
  }

  onMappingConfirmed(mapping: FieldMapping) {
    // 1. Map raw records to Domain Vouchers
    this.vouchers = this.mappingService.mapRecords(this.rawRecords, mapping);

    // 2. Run validations
    this.anomalies = this.validationService.validate(this.vouchers);

    // 3. Calculate Balances
    this.balances = this.balanceCalculator.calculateBalances(this.vouchers);

    this.activeTab = this.anomalies.length > 0 ? 'anomalies' : 'balances';
    this.step = 3;
  }

  reset() {
    this.step = 1;
    this.rawRecords = [];
    this.fileHeaders = [];
    this.vouchers = [];
    this.anomalies = [];
    this.balances = [];
  }
}
