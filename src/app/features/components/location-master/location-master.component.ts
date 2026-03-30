import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryService } from '../../../services/country.service';
import { Country, LocationCreateDto, LocationUpdateDto } from '../../../models/Country.model';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-location-master',
  standalone: false,
  templateUrl: './location-master.component.html',
  styleUrl: './location-master.component.scss',
})
export class LocationMasterComponent implements OnInit {
  location: LocationCreateDto = this.getEmptyLocation();
  isEditMode = false;
  isLoading = false;
  locationId: string | null = null;
  countries: Country[] = [];

  constructor(
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
      error: () => {
        this.toasterService.error('Failed to load countries');
      },
    });
  }

  private checkForEditMode(): void {
    const stateLocation = history.state.location;
    if (stateLocation) {
      this.activateEditMode(stateLocation);
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadLocation(id);
      }
    }
  }

  private activateEditMode(location: any): void {
    this.isEditMode = true;
    this.locationId = location.locationId;
    this.location = {
      locationName: location.locationName || '',
      countryId: location.countryId || '',
      city: location.city || '',
      isActive: location.isActive ?? true,
    };
  }

  private loadLocation(id: string): void {
    this.isLoading = true;
    this.countryService.getLocationById(id).subscribe({
      next: (location) => {
        this.activateEditMode(location);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading location:', err);
        this.toasterService.error('Failed to load location');
        this.isLoading = false;
      },
    });
  }

  private getEmptyLocation(): LocationCreateDto {
    return {
      locationName: '',
      countryId: '',
      city: '',
      isActive: true,
    };
  }

  resetForm(): void {
    this.location = this.getEmptyLocation();
  }

  submitLocation(): void {
    if (this.isLoading) return;

    if (!this.location.locationName || this.location.locationName.trim() === '') {
      this.toasterService.error('Location name is required');
      return;
    }

    if (!this.location.countryId) {
      this.toasterService.error('Please select a country');
      return;
    }

    this.isEditMode && this.locationId
      ? this.updateLocation()
      : this.createLocation();
  }

  private createLocation(): void {
    this.isLoading = true;
    this.countryService.createLocation(this.location).subscribe({
      next: () => {
        this.toasterService.success('Location created successfully');
        this.router.navigate(['/features/location']);
      },
      error: (err) => {
        console.error('Error creating location:', err);
        this.toasterService.error(err.error || 'Failed to create location');
        this.isLoading = false;
      },
    });
  }

  private updateLocation(): void {
    if (!this.locationId) return;
    this.isLoading = true;
    const dto: LocationUpdateDto = {
      locationName: this.location.locationName,
      countryId: this.location.countryId,
      city: this.location.city,
      isActive: this.location.isActive,
    };
    this.countryService.updateLocation(this.locationId, dto).subscribe({
      next: () => {
        this.toasterService.success('Location updated successfully');
        this.router.navigate(['/features/location']);
      },
      error: (err) => {
        console.error('Error updating location:', err);
        this.toasterService.error(err.error || 'Failed to update location');
        this.isLoading = false;
      },
    });
  }
}
