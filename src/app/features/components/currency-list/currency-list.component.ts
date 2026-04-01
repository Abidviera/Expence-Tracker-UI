import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyService, PaginationResponse } from '../../../services/currency.service';
import { CurrencyDTO, CurrencyPaginationRequest } from '../../../models/currency.model';
import { ModalService } from '../../../services/modal.service';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-currency-list',
  standalone: false,
  templateUrl: './currency-list.component.html',
  styleUrl: './currency-list.component.scss',
})
export class CurrencyListComponent implements OnInit {
  filterSection = false;
  isLoading = false;
  currencies: CurrencyDTO[] = [];
  totalRecords = 0;

  filters: CurrencyPaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: 'asc',
  };

  constructor(
    private currencyService: CurrencyService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadCurrencies();
  }

  loadCurrencies(): void {
    this.isLoading = true;
    this.currencyService.getPagedCurrencies(this.filters).subscribe({
      next: (response) => {
        this.currencies = response.data;
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching currencies:', error);
        this.isLoading = false;
      },
    });
  }

  toggleFilters(): void {
    this.filterSection = !this.filterSection;
  }

  onSearchChange(searchTerm: string): void {
    this.filters.searchTerm = searchTerm;
    this.filters.pageNumber = 1;
    this.loadCurrencies();
  }

  onSortChange(sortColumn: string, sortDirection: string): void {
    this.filters.sortColumn = sortColumn;
    this.filters.sortDirection = sortDirection;
    this.filters.pageNumber = 1;
    this.loadCurrencies();
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: '',
      sortDirection: 'asc',
    };
    this.loadCurrencies();
  }

  hasActiveFilters(): boolean {
    return false;
  }

  nextPage(): void {
    this.filters.pageNumber++;
    this.loadCurrencies();
  }

  previousPage(): void {
    if (this.filters.pageNumber && this.filters.pageNumber > 1) {
      this.filters.pageNumber--;
      this.loadCurrencies();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.filters.pageNumber = page;
      this.loadCurrencies();
    }
  }

  getStartItem(): number {
    return ((this.filters.pageNumber || 1) - 1) * (this.filters.pageSize || 10) + 1;
  }

  getEndItem(): number {
    const end = (this.filters.pageNumber || 1) * (this.filters.pageSize || 10);
    return end > this.totalRecords ? this.totalRecords : end;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / (this.filters.pageSize || 10));
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.filters.pageNumber || 1;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }

  editCurrency(id: string): void {
    this.router.navigate(['/features/currency/edit', id]);
  }

  deleteCurrency(id: string): void {
    this.modalService
      .confirm('Delete Currency', 'Are you sure you want to delete this currency? This action cannot be undone.')
      .then((confirmed) => {
        if (confirmed) {
          this.currencyService.deleteCurrency(id).subscribe({
            next: () => {
              this.toastService.success('Currency deleted successfully');
              this.loadCurrencies();
            },
            error: (err) => {
              console.error('Error deleting currency:', err);
              this.toastService.error(err.error || 'Failed to delete currency');
            },
          });
        }
      });
  }

  navigateToCreate(): void {
    this.router.navigate(['/features/currency/new']);
  }

  getCurrencyDisplay(currency: CurrencyDTO): string {
    if (currency.imageUrl) {
      return `<img src="${currency.imageUrl}" class="currency-img" alt="${currency.code}" /> ${currency.code}`;
    }
    return `${currency.symbol} ${currency.code}`;
  }
}
