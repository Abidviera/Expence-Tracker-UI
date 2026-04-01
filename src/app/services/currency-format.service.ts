import { Injectable } from '@angular/core';
import { CurrencyDTO } from '../models/currency.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyFormatService {
  private _activeCurrency: CurrencyDTO | null = null;

  get activeCurrency(): CurrencyDTO | null {
    return this._activeCurrency;
  }

  setActiveCurrency(currency: CurrencyDTO): void {
    this._activeCurrency = currency;
  }

  clearCurrency(): void {
    this._activeCurrency = null;
  }

  format(amount: number | null | undefined, decimals: number = 2): string {
    if (amount == null) return '';

    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    if (!this._activeCurrency) return formatted;

    const symbol = this._activeCurrency.imageUrl
      ? `<img src="${this._activeCurrency.imageUrl}" class="currency-icon-img" alt="${this._activeCurrency.code}" />`
      : this._activeCurrency.symbol;

    return `${symbol}${formatted}`;
  }

  formatWhole(amount: number | null | undefined): string {
    return this.format(amount ?? 0, 0);
  }

  formatCompact(amount: number | null | undefined): string {
    if (amount == null) return '';

    const formatted = Number(amount).toLocaleString('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    });

    if (!this._activeCurrency) return formatted;

    const symbol = this._activeCurrency.imageUrl
      ? `<img src="${this._activeCurrency.imageUrl}" class="currency-icon-img" alt="${this._activeCurrency.code}" />`
      : this._activeCurrency.symbol;

    return `${symbol}${formatted}`;
  }
}
