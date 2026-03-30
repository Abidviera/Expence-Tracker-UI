import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CountryService } from '../../../services/country.service';
import { Location, LocationPaginationRequest, Country } from '../../../models/Country.model';
import { ModalService } from '../../../services/modal.service';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-location-list',
  standalone: false,
  templateUrl: './location-list.component.html',
  styleUrl: './location-list.component.scss',
})
export class LocationListComponent implements OnInit {
  filterSection = false;
  isLoading = false;
  locations: Location[] = [];
  countries: Country[] = [];
  totalRecords = 0;

  filters: LocationPaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: 'asc',
  };

  constructor(
    private countryService: CountryService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
    this.loadLocations();
  }

  private loadCountries(): void {
    this.countryService.getActiveCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
    });
  }

  loadLocations(): void {
    this.isLoading = true;
    this.countryService.getPagedLocations(this.filters).subscribe({
      next: (response) => {
        this.locations = response.data;
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
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
    this.loadLocations();
  }

  onSortChange(sortColumn: string, sortDirection: string): void {
    this.filters.sortColumn = sortColumn;
    this.filters.sortDirection = sortDirection;
    this.filters.pageNumber = 1;
    this.loadLocations();
  }

  onCountryFilter(countryId: string): void {
    this.filters.countryId = countryId ? countryId as any : undefined;
    this.filters.pageNumber = 1;
    this.loadLocations();
  }

  onStatusFilter(isActive: string): void {
    if (isActive === '') {
      this.filters.isActive = undefined;
    } else {
      this.filters.isActive = isActive === 'true';
    }
    this.filters.pageNumber = 1;
    this.loadLocations();
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: '',
      sortDirection: 'asc',
    };
    this.loadLocations();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.countryId || this.filters.isActive !== undefined);
  }

  clearCountry(): void {
    this.filters.countryId = undefined;
    this.filters.pageNumber = 1;
    this.loadLocations();
  }

  clearStatus(): void {
    this.filters.isActive = undefined;
    this.filters.pageNumber = 1;
    this.loadLocations();
  }

  nextPage(): void {
    this.filters.pageNumber++;
    this.loadLocations();
  }

  previousPage(): void {
    if (this.filters.pageNumber && this.filters.pageNumber > 1) {
      this.filters.pageNumber--;
      this.loadLocations();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.filters.pageNumber = page;
      this.loadLocations();
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

  editLocation(locationId: string): void {
    this.router.navigate(['/features/location/edit', locationId]);
  }

  deleteLocation(locationId: string): void {
    this.modalService
      .confirm('Delete Location', 'Are you sure you want to delete this location?')
      .then((confirmed) => {
        if (confirmed) {
          this.countryService.deleteLocation(locationId).subscribe({
            next: () => {
              this.toastService.success('Location deleted successfully');
              this.loadLocations();
            },
            error: (err) => {
              console.error('Error deleting location:', err);
              this.toastService.error('Failed to delete location');
            },
          });
        }
      });
  }

  navigateToCreate(): void {
    this.router.navigate(['/features/location/new']);
  }

  getCountryName(countryId: string): string {
    const country = this.countries.find((c) => c.countryId === countryId);
    return country ? country.countryName : '';
  }
}
