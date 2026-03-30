import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryService } from '../../../services/country.service';
import { CountryCreateDto, CountryUpdateDto } from '../../../models/Country.model';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-country-master',
  standalone: false,
  templateUrl: './country-master.component.html',
  styleUrl: './country-master.component.scss',
})
export class CountryMasterComponent implements OnInit {
  country: CountryCreateDto = this.getEmptyCountry();
  isEditMode = false;
  isLoading = false;
  countryId: string | null = null;

  regions = [
    'Asia',
    'Europe',
    'North America',
    'South America',
    'Africa',
    'Oceania',
    'Middle East',
    'Central Asia',
    'Southeast Asia',
    'East Asia',
    'South Asia',
    'Caribbean',
    'Central America',
  ];

  constructor(
    private countryService: CountryService,
    private toasterService: ToasterService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkForEditMode();
  }

  private checkForEditMode(): void {
    const stateCountry = history.state.country;
    if (stateCountry) {
      this.activateEditMode(stateCountry);
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadCountry(id);
      }
    }
  }

  private activateEditMode(country: any): void {
    this.isEditMode = true;
    this.countryId = country.countryId;
    this.country = {
      countryCode: country.countryCode || '',
      countryName: country.countryName || '',
      region: country.region || '',
      isActive: country.isActive ?? true,
    };
  }

  private loadCountry(id: string): void {
    this.isLoading = true;
    this.countryService.getCountryById(id).subscribe({
      next: (country) => {
        this.activateEditMode(country);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading country:', err);
        this.toasterService.error('Failed to load country');
        this.isLoading = false;
      },
    });
  }

  private getEmptyCountry(): CountryCreateDto {
    return {
      countryCode: '',
      countryName: '',
      region: '',
      isActive: true,
    };
  }

  resetForm(): void {
    this.country = this.getEmptyCountry();
  }

  submitCountry(): void {
    if (this.isLoading) return;

    if (!this.country.countryCode || this.country.countryCode.trim() === '') {
      this.toasterService.error('Country code is required');
      return;
    }

    if (!this.country.countryName || this.country.countryName.trim() === '') {
      this.toasterService.error('Country name is required');
      return;
    }

    this.isEditMode && this.countryId
      ? this.updateCountry()
      : this.createCountry();
  }

  private createCountry(): void {
    this.isLoading = true;
    this.countryService.createCountry(this.country).subscribe({
      next: () => {
        this.toasterService.success('Country created successfully');
        this.router.navigate(['/features/country']);
      },
      error: (err) => {
        console.error('Error creating country:', err);
        this.toasterService.error(err.error || 'Failed to create country');
        this.isLoading = false;
      },
    });
  }

  private updateCountry(): void {
    if (!this.countryId) return;
    this.isLoading = true;
    const dto: CountryUpdateDto = {
      countryCode: this.country.countryCode,
      countryName: this.country.countryName,
      region: this.country.region,
      isActive: this.country.isActive,
    };
    this.countryService.updateCountry(this.countryId, dto).subscribe({
      next: () => {
        this.toasterService.success('Country updated successfully');
        this.router.navigate(['/features/country']);
      },
      error: (err) => {
        console.error('Error updating country:', err);
        this.toasterService.error(err.error || 'Failed to update country');
        this.isLoading = false;
      },
    });
  }
}
