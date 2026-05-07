import { Component, Input, OnInit, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Voucher } from '../../models/voucher';
import * as QRCode from 'qrcode';

// Note: In an Electron app, we can require ipcRenderer conditionally
const electron = (window as any).require ? (window as any).require('electron') : null;

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent implements OnInit, OnDestroy {
  @Input() vouchers: Voucher[] = [];

  scannerUrl: string = '';
  qrCodeUrl: string = '';
  matchedScans: any[] = [];

  constructor(private zone: NgZone) {}

  async ngOnInit() {
    if (electron && electron.ipcRenderer) {
      // 1. Send expected vouchers to backend for matching
      electron.ipcRenderer.send('set-vouchers', this.vouchers);

      // 2. Get local IP URL for scanner
      this.scannerUrl = await electron.ipcRenderer.invoke('get-scanner-url');

      // 3. Generate QR Code
      try {
        this.qrCodeUrl = await QRCode.toDataURL(this.scannerUrl, { margin: 1, width: 200 });
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }

      // 4. Listen for real-time matches
      electron.ipcRenderer.on('scan-matched', (event: any, data: any) => {
        this.zone.run(() => {
          this.matchedScans.unshift(data); // add to top of feed
        });
      });
    } else {
      this.scannerUrl = 'http://localhost:3000 (Non-Electron environment)';
    }
  }

  ngOnDestroy() {
    if (electron && electron.ipcRenderer) {
      electron.ipcRenderer.removeAllListeners('scan-matched');
    }
  }
}
