import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CountryService } from '../../../services/country.service';
import { Country, CountryPaginationRequest } from '../../../models/Country.model';
import { ModalService } from '../../../services/modal.service';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-country-list',
  standalone: false,
  templateUrl: './country-list.component.html',
  styleUrl: './country-list.component.scss',
})
export class CountryListComponent implements OnInit {
  filterSection = false;
  isLoading = false;
  countries: Country[] = [];
  totalRecords = 0;

  filters: CountryPaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: 'asc',
  };

  uniqueRegions: string[] = [];

  constructor(
    private countryService: CountryService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.isLoading = true;
    this.countryService.getPagedCountries(this.filters).subscribe({
      next: (response) => {
        this.countries = response.data;
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
        this.extractRegions();
      },
      error: (error) => {
        console.error('Error fetching countries:', error);
        this.isLoading = false;
      },
    });
  }

  private extractRegions(): void {
    const regions = this.countries
      .map((c) => c.region)
      .filter((r) => !!r);
    this.uniqueRegions = [...new Set(regions)].sort();
  }

  toggleFilters(): void {
    this.filterSection = !this.filterSection;
  }

  onSearchChange(searchTerm: string): void {
    this.filters.searchTerm = searchTerm;
    this.filters.pageNumber = 1;
    this.loadCountries();
  }

  onSortChange(sortColumn: string, sortDirection: string): void {
    this.filters.sortColumn = sortColumn;
    this.filters.sortDirection = sortDirection;
    this.filters.pageNumber = 1;
    this.loadCountries();
  }

  onRegionFilter(region: string): void {
    this.filters.region = region || undefined;
    this.filters.pageNumber = 1;
    this.loadCountries();
  }

  onStatusFilter(isActive: string): void {
    if (isActive === '') {
      this.filters.isActive = undefined;
    } else {
      this.filters.isActive = isActive === 'true';
    }
    this.filters.pageNumber = 1;
    this.loadCountries();
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: '',
      sortDirection: 'asc',
    };
    this.loadCountries();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.region || this.filters.isActive !== undefined);
  }

  clearRegion(): void {
    this.filters.region = undefined;
    this.filters.pageNumber = 1;
    this.loadCountries();
  }

  clearStatus(): void {
    this.filters.isActive = undefined;
    this.filters.pageNumber = 1;
    this.loadCountries();
  }

  nextPage(): void {
    this.filters.pageNumber++;
    this.loadCountries();
  }

  previousPage(): void {
    if (this.filters.pageNumber && this.filters.pageNumber > 1) {
      this.filters.pageNumber--;
      this.loadCountries();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.filters.pageNumber = page;
      this.loadCountries();
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

  editCountry(countryId: string): void {
    this.router.navigate(['/features/country/edit', countryId]);
  }

  deleteCountry(countryId: string): void {
    this.modalService
      .confirm('Delete Country', 'Are you sure you want to delete this country? All associated locations will remain but will be unlinked.')
      .then((confirmed) => {
        if (confirmed) {
          this.countryService.deleteCountry(countryId).subscribe({
            next: () => {
              this.toastService.success('Country deleted successfully');
              this.loadCountries();
            },
            error: (err) => {
              console.error('Error deleting country:', err);
              this.toastService.error('Failed to delete country');
            },
          });
        }
      });
  }

  navigateToCreate(): void {
    this.router.navigate(['/features/country/new']);
  }
}
