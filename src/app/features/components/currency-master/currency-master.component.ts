import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyService } from '../../../services/currency.service';
import { CurrencyCreateDto, CurrencyUpdateDto, CurrencyDTO } from '../../../models/currency.model';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-currency-master',
  standalone: false,
  templateUrl: './currency-master.component.html',
  styleUrl: './currency-master.component.scss',
})
export class CurrencyMasterComponent implements OnInit {
  currency: CurrencyCreateDto = this.getEmptyCurrency();
  isEditMode = false;
  isLoading = false;
  currencyId: string | null = null;

  constructor(
    private currencyService: CurrencyService,
    private toasterService: ToasterService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkForEditMode();
  }

  private checkForEditMode(): void {
    const stateCurrency = history.state.currency;
    if (stateCurrency) {
      this.activateEditMode(stateCurrency);
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadCurrency(id);
      }
    }
  }

  private activateEditMode(currency: CurrencyDTO): void {
    this.isEditMode = true;
    this.currencyId = currency.currencyId;
    this.currency = {
      name: currency.name || '',
      code: currency.code || '',
      symbol: currency.symbol || '',
      imageUrl: currency.imageUrl || '',
      description: currency.description || '',
      isActive: currency.isActive,
    };
  }

  private loadCurrency(id: string): void {
    this.isLoading = true;
    this.currencyService.getCurrencyById(id).subscribe({
      next: (currency) => {
        this.activateEditMode(currency);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading currency:', err);
        this.toasterService.error('Failed to load currency');
        this.isLoading = false;
      },
    });
  }

  private getEmptyCurrency(): CurrencyCreateDto {
    return {
      name: '',
      code: '',
      symbol: '',
      imageUrl: '',
      description: '',
      isActive: true,
    };
  }

  resetForm(): void {
    this.currency = this.getEmptyCurrency();
  }

  submitCurrency(): void {
    if (this.isLoading) return;

    if (!this.currency.name || this.currency.name.trim() === '') {
      this.toasterService.error('Currency name is required');
      return;
    }
    if (!this.currency.code || this.currency.code.trim() === '') {
      this.toasterService.error('Currency code is required');
      return;
    }
    if (!this.currency.symbol || this.currency.symbol.trim() === '') {
      this.toasterService.error('Currency symbol is required');
      return;
    }

    this.isEditMode && this.currencyId
      ? this.updateCurrency()
      : this.createCurrency();
  }

  private createCurrency(): void {
    this.isLoading = true;
    this.currencyService.createCurrency(this.currency).subscribe({
      next: () => {
        this.toasterService.success('Currency created successfully');
        this.router.navigate(['/features/currency']);
      },
      error: (err) => {
        console.error('Error creating currency:', err);
        this.toasterService.error(err.error || 'Failed to create currency');
        this.isLoading = false;
      },
    });
  }

  private updateCurrency(): void {
    if (!this.currencyId) return;
    this.isLoading = true;
    const dto: CurrencyUpdateDto = {
      name: this.currency.name,
      code: this.currency.code,
      symbol: this.currency.symbol,
      imageUrl: this.currency.imageUrl,
      description: this.currency.description,
      isActive: this.currency.isActive,
    };
    this.currencyService.updateCurrency(this.currencyId, dto).subscribe({
      next: () => {
        this.toasterService.success('Currency updated successfully');
        this.router.navigate(['/features/currency']);
      },
      error: (err) => {
        console.error('Error updating currency:', err);
        this.toasterService.error(err.error || 'Failed to update currency');
        this.isLoading = false;
      },
    });
  }

  previewImage(): string {
    return this.currency.imageUrl || '';
  }
}
