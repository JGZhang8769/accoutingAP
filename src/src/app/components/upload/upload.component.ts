import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @Output() fileLoaded = new EventEmitter<File>();
  errorMessage: string = '';

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        this.errorMessage = '';
        this.fileLoaded.emit(file);
      } else {
        this.errorMessage = '僅支援 CSV 或 Excel (.xlsx, .xls) 檔案格式。';
      }
    }
  }
}
