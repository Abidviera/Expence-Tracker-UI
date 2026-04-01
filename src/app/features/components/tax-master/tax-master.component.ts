import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaxService } from '../../../services/tax.service';
import { TaxCreateDto, TaxUpdateDto, TaxDTO } from '../../../models/tax.model';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-tax-master',
  standalone: false,
  templateUrl: './tax-master.component.html',
  styleUrl: './tax-master.component.scss',
})
export class TaxMasterComponent implements OnInit {
  tax: TaxCreateDto = this.getEmptyTax();
  isEditMode = false;
  isLoading = false;
  taxId: string | null = null;

  constructor(
    private taxService: TaxService,
    private toasterService: ToasterService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkForEditMode();
  }

  private checkForEditMode(): void {
    const stateTax = history.state.tax;
    if (stateTax) {
      this.activateEditMode(stateTax);
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadTax(id);
      }
    }
  }

  private activateEditMode(tax: TaxDTO): void {
    this.isEditMode = true;
    this.taxId = tax.taxId;
    this.tax = {
      name: tax.name || '',
      percentage: tax.percentage,
      description: tax.description || '',
      isActive: tax.isActive,
      isEnabled: tax.isEnabled,
    };
  }

  private loadTax(id: string): void {
    this.isLoading = true;
    this.taxService.getTaxById(id).subscribe({
      next: (tax) => {
        this.activateEditMode(tax);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading tax:', err);
        this.toasterService.error('Failed to load tax');
        this.isLoading = false;
      },
    });
  }

  private getEmptyTax(): TaxCreateDto {
    return {
      name: '',
      percentage: 0,
      description: '',
      isActive: true,
      isEnabled: true,
    };
  }

  resetForm(): void {
    this.tax = this.getEmptyTax();
  }

  submitTax(): void {
    if (this.isLoading) return;

    if (!this.tax.name || this.tax.name.trim() === '') {
      this.toasterService.error('Tax name is required');
      return;
    }
    if (this.tax.percentage < 0 || this.tax.percentage > 100) {
      this.toasterService.error('Tax percentage must be between 0 and 100');
      return;
    }

    this.isEditMode && this.taxId
      ? this.updateTax()
      : this.createTax();
  }

  private createTax(): void {
    this.isLoading = true;
    this.taxService.createTax(this.tax).subscribe({
      next: () => {
        this.toasterService.success('Tax created successfully');
        this.router.navigate(['/features/tax']);
      },
      error: (err) => {
        console.error('Error creating tax:', err);
        this.toasterService.error(err.error || 'Failed to create tax');
        this.isLoading = false;
      },
    });
  }

  private updateTax(): void {
    if (!this.taxId) return;
    this.isLoading = true;
    const dto: TaxUpdateDto = {
      name: this.tax.name,
      percentage: this.tax.percentage,
      description: this.tax.description,
      isActive: this.tax.isActive,
      isEnabled: this.tax.isEnabled,
    };
    this.taxService.updateTax(this.taxId, dto).subscribe({
      next: () => {
        this.toasterService.success('Tax updated successfully');
        this.router.navigate(['/features/tax']);
      },
      error: (err) => {
        console.error('Error updating tax:', err);
        this.toasterService.error(err.error || 'Failed to update tax');
        this.isLoading = false;
      },
    });
  }
}
