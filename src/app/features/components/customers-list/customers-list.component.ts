import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { CustomerPaginationRequest } from '../../../models/Customer.model';
import { Customer } from '../../../models/Customer.model';
import { ModalService } from '../../../services/modal.service';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-customers-list',
  standalone: false,
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss',
})
export class CustomersListComponent implements OnInit {
  filterSection = false;
  isLoading = false;
  customers: Customer[] = [];
  totalRecords = 0;

  filters: CustomerPaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: 'asc',
    country: '',
  };

  uniqueCountries: string[] = [];

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadUniqueCountries();
  }

  private loadUniqueCountries(): void {
    this.customerService.getCustomers().subscribe({
      next: (response) => {
        this.uniqueCountries = [...new Set(response.data.map(c => c.country).filter(Boolean))].sort();
      }
    });
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getPagedCustomers(this.filters).subscribe({
      next: (response) => {
        this.customers = response.data;
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching customers:', error);
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
    this.loadCustomers();
  }

  onSortChange(sortColumn: string, sortDirection: string): void {
    this.filters.sortColumn = sortColumn;
    this.filters.sortDirection = sortDirection;
    this.filters.pageNumber = 1;
    this.loadCustomers();
  }

  onCountryFilter(country: string): void {
    this.filters.country = country || undefined;
    this.filters.pageNumber = 1;
    this.loadCustomers();
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: '',
      sortDirection: 'asc',
      country: '',
    };
    this.loadCustomers();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.country ||
      this.filters.searchTerm
    );
  }

  clearCountry(): void {
    this.filters.country = '';
    this.filters.pageNumber = 1;
    this.loadCustomers();
  }

  nextPage(): void {
    if (this.filters.pageNumber) {
      this.filters.pageNumber++;
      this.loadCustomers();
    }
  }

  previousPage(): void {
    if (this.filters.pageNumber && this.filters.pageNumber > 1) {
      this.filters.pageNumber--;
      this.loadCustomers();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.filters.pageNumber = page;
      this.loadCustomers();
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

  editCustomer(customerId: string): void {
    this.router.navigate(['/features/customers/edit', customerId]);
  }

  deleteCustomer(customerId: string): void {
    this.modalService
      .confirm('Delete Customer', 'Are you sure you want to delete this customer?')
      .then((confirmed) => {
        if (confirmed) {
          this.customerService.deleteCustomer(customerId).subscribe({
            next: () => {
              this.toastService.success('Customer deleted successfully');
              this.loadCustomers();
            },
            error: (err) => {
              console.error('Error deleting customer:', err);
            },
          });
        }
      });
  }

  navigateToCreate(): void {
    this.router.navigate(['/features/customers/new']);
  }
}
