import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaxService, PaginationResponse } from '../../../services/tax.service';
import { TaxDTO, TaxPaginationRequest } from '../../../models/tax.model';
import { ModalService } from '../../../services/modal.service';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-tax-list',
  standalone: false,
  templateUrl: './tax-list.component.html',
  styleUrl: './tax-list.component.scss',
})
export class TaxListComponent implements OnInit {
  filterSection = false;
  isLoading = false;
  taxes: TaxDTO[] = [];
  totalRecords = 0;

  filters: TaxPaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: 'asc',
  };

  constructor(
    private taxService: TaxService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadTaxes();
  }

  loadTaxes(): void {
    this.isLoading = true;
    this.taxService.getPagedTaxes(this.filters).subscribe({
      next: (response) => {
        this.taxes = response.data;
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching taxes:', error);
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
    this.loadTaxes();
  }

  onSortChange(sortColumn: string, sortDirection: string): void {
    this.filters.sortColumn = sortColumn;
    this.filters.sortDirection = sortDirection;
    this.filters.pageNumber = 1;
    this.loadTaxes();
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: '',
      sortDirection: 'asc',
    };
    this.loadTaxes();
  }

  hasActiveFilters(): boolean {
    return false;
  }

  nextPage(): void {
    this.filters.pageNumber++;
    this.loadTaxes();
  }

  previousPage(): void {
    if (this.filters.pageNumber && this.filters.pageNumber > 1) {
      this.filters.pageNumber--;
      this.loadTaxes();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.filters.pageNumber = page;
      this.loadTaxes();
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

  editTax(id: string): void {
    this.router.navigate(['/features/tax/edit', id]);
  }

  deleteTax(id: string): void {
    this.modalService
      .confirm('Delete Tax', 'Are you sure you want to delete this tax? This action cannot be undone.')
      .then((confirmed) => {
        if (confirmed) {
          this.taxService.deleteTax(id).subscribe({
            next: () => {
              this.toastService.success('Tax deleted successfully');
              this.loadTaxes();
            },
            error: (err) => {
              console.error('Error deleting tax:', err);
              this.toastService.error(err.error || 'Failed to delete tax');
            },
          });
        }
      });
  }

  navigateToCreate(): void {
    this.router.navigate(['/features/tax/new']);
  }

  toggleEnabled(tax: TaxDTO): void {
    const dto = {
      name: tax.name,
      percentage: tax.percentage,
      description: tax.description,
      isActive: tax.isActive,
      isEnabled: !tax.isEnabled,
    };
    this.taxService.updateTax(tax.taxId, dto).subscribe({
      next: () => {
        tax.isEnabled = !tax.isEnabled;
        this.toastService.success(
          tax.isEnabled ? 'Tax enabled successfully' : 'Tax disabled successfully'
        );
      },
      error: (err) => {
        console.error('Error toggling tax:', err);
        this.toastService.error(err.error || 'Failed to update tax');
      },
    });
  }
}
