import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-invoice-template3',
  standalone: false,
  templateUrl: './invoice-template3.component.html',
  styleUrl: './invoice-template3.component.scss',
})
export class InvoiceTemplate3Component {
  @Input() expenseData: any;
  @ViewChild('printContent') printContent!: ElementRef;

  constructor(public activeModal: NgbActiveModal) {}

  printInvoice() {
    const printContent = this.printContent.nativeElement;
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Could not open print window. Please allow popups for this site.');
      return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice Print</title>
            <style>
                body { margin: 0; padding: 0;  font-family: 'Roboto', 'Segoe UI', sans-serif}
                @page { size: auto; margin: 0mm; }
            </style>
        </head>
        <body>
            ${printContent.innerHTML}
        </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    };
  }

  async downloadPDF() {
    try {
      const printContent = this.printContent.nativeElement;

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px';
      document.body.appendChild(tempContainer);

      const clone = printContent.cloneNode(true) as HTMLElement;
      tempContainer.appendChild(clone);

      clone.querySelectorAll('*').forEach((element) => {
        const el = element as HTMLElement;
        el.style.boxShadow = 'none';
        if (
          el.style.background === 'transparent' ||
          el.style.background === 'rgba(0, 0, 0, 0)'
        ) {
          el.style.background = '';
        }
      });

      const canvas = await html2canvas(clone, {
        scale: 1,
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: clone.scrollWidth,
        height: clone.scrollHeight,
        backgroundColor: null,
        onclone: (clonedDoc) => {
          const root = clonedDoc.getElementById(clone.id) || clonedDoc.body;
          root.querySelectorAll('*').forEach((el) => {
            (el as HTMLElement).style.visibility = 'visible';
          });
        },
      });

      document.body.removeChild(tempContainer);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pageHeight = 297;
      let position = 0;
      let remainingHeight = imgHeight;

      while (remainingHeight > 0) {
        if (position > 0) {
          pdf.addPage();
        }

        const heightToAdd = Math.min(remainingHeight, pageHeight);

        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          -position,
          imgWidth,
          imgHeight
        );

        position += heightToAdd;
        remainingHeight -= heightToAdd;
      }

      pdf.save(`Invoice_${this.expenseData?.invoiceNumber || Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(
        'Error generating PDF. Please try again or use the print function.'
      );
    }
  }
  closeModal() {
    this.activeModal.close();
  }
}
