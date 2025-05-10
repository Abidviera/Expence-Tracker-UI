import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-export-modal',
  standalone: false,
  templateUrl: './export-modal.component.html',
  styleUrl: './export-modal.component.scss'
})
export class ExportModalComponent {
selectedFormat: 'excel' | 'csv' | null = null;
  
  @Output() exportRequested = new EventEmitter<'excel' | 'csv'>();
  @Output() modalClosed = new EventEmitter<void>();

  selectFormat(format: 'excel' | 'csv'): void {
    this.selectedFormat = format;
  }

  export(): void {
    if (this.selectedFormat) {
      this.exportRequested.emit(this.selectedFormat);
    }
  }

  close(): void {
    this.modalClosed.emit();
  }
}
