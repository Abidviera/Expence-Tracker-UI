import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyFormatService } from '../services/currency-format.service';

@Pipe({
  name: 'currencyDisplay',
  standalone: false,
  pure: false
})
export class CurrencyDisplayPipe implements PipeTransform {
  constructor(private currencyFormatService: CurrencyFormatService) {}

  transform(amount: number | null | undefined, decimals?: number): string {
    return this.currencyFormatService.format(amount, decimals);
  }
}
