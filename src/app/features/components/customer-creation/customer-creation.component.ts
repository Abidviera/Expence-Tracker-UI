import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { CountryService } from '../../../services/country.service';
import { CustomerCreateDto } from '../../../models/Customer.model';
import { Country, Location } from '../../../models/Country.model';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-customer-creation',
  standalone: false,
  templateUrl: './customer-creation.component.html',
  styleUrl: './customer-creation.component.scss',
})
export class CustomerCreationComponent implements OnInit {
  customer: CustomerCreateDto = this.getEmptyCustomer();
  isEditMode = false;
  isLoading = false;
  customerId: string | null = null;
  countries: Country[] = [];
  locations: Location[] = [];
  filteredLocations: Location[] = [];

  constructor(
    private customerService: CustomerService,
    private countryService: CountryService,
    private toasterService: ToasterService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCountries();
    this.checkForEditMode();
  }

  private loadCountries(): void {
    this.countryService.getActiveCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
    });
  }

  onCountryChange(countryId: string): void {
    this.customer.countryId = countryId || undefined;
    this.customer.country = '';
    this.customer.locationId = undefined;
    this.customer.location = '';
    this.filteredLocations = [];

    if (countryId) {
      this.countryService.getLocationsByCountry(countryId).subscribe({
        next: (locations) => {
          this.filteredLocations = locations.filter(l => l.isActive);
          this.locations = [...this.locations, ...locations];
        },
      });
    }
  }

  onLocationChange(locationId: string): void {
    if (locationId) {
      const location = this.filteredLocations.find(l => l.locationId === locationId);
      if (location) {
        this.customer.locationId = locationId;
        this.customer.location = location.locationName;
        const country = this.countries.find(c => c.countryId === location.countryId);
        if (country) {
          this.customer.countryId = country.countryId;
          this.customer.country = country.countryName;
        }
      }
    } else {
      this.customer.locationId = undefined;
      this.customer.location = '';
    }
  }

  private checkForEditMode(): void {
    const customer = history.state.customer;
    if (customer) {
      this.activateEditMode(customer);
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadCustomer(id);
      }
    }
  }

  private activateEditMode(customer: any): void {
    this.isEditMode = true;
    this.customerId = customer.customerId;
    this.customer = {
      name: customer.name || '',
      email: customer.email || '',
      phoneNumber: customer.phoneNumber || '',
      countryId: customer.countryId || '',
      country: customer.country || '',
      locationId: customer.locationId || '',
      location: customer.location || '',
      address: customer.address || '',
    };

    if (customer.countryId) {
      this.countryService.getLocationsByCountry(customer.countryId).subscribe({
        next: (locations) => {
          this.filteredLocations = locations.filter(l => l.isActive);
          this.locations = locations;
        },
      });
    } else if (customer.country) {
      const matchedCountry = this.countries.find(
        c => c.countryName === customer.country || c.countryCode === customer.country
      );
      if (matchedCountry) {
        this.countryService.getLocationsByCountry(matchedCountry.countryId).subscribe({
          next: (locations) => {
            this.filteredLocations = locations.filter(l => l.isActive);
            this.locations = locations;
          },
        });
      }
    }
  }

  private loadCustomer(id: string): void {
    this.isLoading = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.activateEditMode(customer);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customer:', err);
        this.toasterService.error('Failed to load customer');
        this.isLoading = false;
      },
    });
  }

  private getEmptyCustomer(): CustomerCreateDto {
    return {
      name: '',
      email: '',
      phoneNumber: '',
      countryId: undefined,
      country: '',
      locationId: undefined,
      location: '',
      address: '',
    };
  }

  resetForm(): void {
    this.customer = this.getEmptyCustomer();
    this.filteredLocations = [];
  }

  submitCustomer(): void {
    if (this.isLoading) return;

    if (!this.customer.name || this.customer.name.trim() === '') {
      this.toasterService.error('Customer name is required');
      return;
    }

    if (!this.customer.countryId) {
      this.toasterService.error('Please select a country from the master list');
      return;
    }

    if (!this.customer.locationId) {
      this.toasterService.error('Please select a location from the master list');
      return;
    }

    this.isEditMode && this.customerId
      ? this.updateCustomer()
      : this.createCustomer();
  }

  private createCustomer(): void {
    this.isLoading = true;
    this.customerService.createCustomer(this.customer).subscribe({
      next: () => {
        this.toasterService.success('Customer created successfully');
        this.router.navigate(['/features/customers']);
      },
      error: (err) => {
        console.error('Error creating customer:', err);
        this.toasterService.error('Failed to create customer');
        this.isLoading = false;
      },
    });
  }

  private updateCustomer(): void {
    if (!this.customerId) return;
    this.isLoading = true;
    this.customerService.updateCustomer(this.customerId, this.customer).subscribe({
      next: () => {
        this.toasterService.success('Customer updated successfully');
        this.router.navigate(['/features/customers']);
      },
      error: (err) => {
        console.error('Error updating customer:', err);
        this.toasterService.error('Failed to update customer');
        this.isLoading = false;
      },
    });
  }
}
