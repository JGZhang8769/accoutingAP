import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as jschardet from 'jschardet';

@Injectable({
  providedIn: 'root'
})
export class FileParserService {

  constructor() { }

  parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      // 1. Read a small chunk to detect encoding
      const readerForDetect = new FileReader();
      const chunk = file.slice(0, Math.min(1024 * 50, file.size)); // read up to 50KB to detect

      readerForDetect.onload = (e: any) => {
        const buffer = new Uint8Array(e.target.result);

        // Convert to binary string for jschardet
        let binaryString = '';
        for (let i = 0; i < buffer.length; i++) {
          binaryString += String.fromCharCode(buffer[i]);
        }

        const detection = jschardet.detect(binaryString);
        let encoding = 'utf-8'; // default
        if (detection && detection.encoding) {
          encoding = detection.encoding.toLowerCase();
          // Map some common aliases to standard DOM string encodings
          if (encoding === 'big5' || encoding.includes('big5')) {
            encoding = 'big5';
          } else if (encoding === 'ascii') {
            encoding = 'utf-8';
          }
        }

        // 2. Read the whole file with detected encoding
        const readerForParse = new FileReader();
        readerForParse.onload = (evt: any) => {
            const text = evt.target.result;
            Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                resolve(results.data);
              },
              error: (error: any) => {
                reject(error);
              }
            });
        };
        readerForParse.onerror = (err) => reject(err);
        readerForParse.readAsText(file, encoding);
      };

      readerForDetect.onerror = (err) => reject(err);
      readerForDetect.readAsArrayBuffer(chunk);
    });
  }

  parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  async parseFile(file: File): Promise<any[]> {
    if (file.name.endsWith('.csv')) {
      return this.parseCSV(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      return this.parseExcel(file);
    } else {
      throw new Error('Unsupported file format');
    }
  }
}
