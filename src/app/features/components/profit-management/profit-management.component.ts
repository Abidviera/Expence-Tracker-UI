import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportService } from '../../../services/report.service';
import { CountryService } from '../../../services/country.service';
import {
  ReportRequest,
  ReportResponse,
  Country,
  Location,
} from '../../../models/Country.model';
import { ToasterService } from '../../../services/toaster.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-profit-management',
  standalone: false,
  templateUrl: './profit-management.component.html',
  styleUrl: './profit-management.component.scss',
})
export class ProfitManagementComponent implements OnInit {
  reportRequest: ReportRequest = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  };

  report: ReportResponse | null = null;
  isLoading = false;
  hasGenerated = false;

  countries: Country[] = [];
  filteredLocations: Location[] = [];

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  years: number[] = [];
  activeSection: 'summary' | 'country' | 'location' | 'customers' = 'summary';

  constructor(
    private reportService: ReportService,
    private countryService: CountryService,
    private toasterService: ToasterService,
    private exportService: ExportService
  ) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    this.loadCountries();
  }

  private loadCountries(): void {
    this.countryService.getActiveCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
    });
  }

  onCountryChange(countryId: string): void {
    if (countryId) {
      this.reportRequest.countryId = countryId;
      const country = this.countries.find((c) => c.countryId === countryId);
      this.reportRequest.countryName = country?.countryName;
      this.countryService.getLocationsByCountry(countryId).subscribe({
        next: (locations) => {
          this.filteredLocations = locations.filter((l) => l.isActive);
        },
      });
    } else {
      this.reportRequest.countryId = undefined;
      this.reportRequest.countryName = undefined;
      this.filteredLocations = [];
      this.reportRequest.locationId = undefined;
      this.reportRequest.locationName = undefined;
    }
    this.reportRequest.locationId = undefined;
    this.reportRequest.locationName = undefined;
  }

  onLocationChange(locationId: string): void {
    if (locationId) {
      const location = this.filteredLocations.find((l) => l.locationId === locationId);
      this.reportRequest.locationId = locationId;
      this.reportRequest.locationName = location?.locationName;
    } else {
      this.reportRequest.locationId = undefined;
      this.reportRequest.locationName = undefined;
    }
  }

  generateReport(): void {
    this.isLoading = true;
    this.hasGenerated = false;
    this.activeSection = 'summary';
    this.reportService.generateReport(this.reportRequest).subscribe({
      next: (report) => {
        this.report = report;
        this.hasGenerated = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error generating report:', err);
        this.toasterService.error('Failed to generate report');
        this.isLoading = false;
      },
    });
  }

  resetFilters(): void {
    this.reportRequest = {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    };
    this.filteredLocations = [];
    this.report = null;
    this.hasGenerated = false;
  }

  setActiveSection(section: 'summary' | 'country' | 'location' | 'customers'): void {
    this.activeSection = section;
  }

  exportToExcel(): void {
    if (!this.report) return;

    const data: any[] = [];

    data.push({ Section: 'SUMMARY', Label: 'Total Customers', Value: this.report.summary.totalCustomers });
    data.push({ Section: 'SUMMARY', Label: 'Total Countries', Value: this.report.summary.totalCountries });
    data.push({ Section: 'SUMMARY', Label: 'Total Locations', Value: this.report.summary.totalLocations });
    data.push({ Section: 'SUMMARY', Label: 'Total Expenses', Value: this.report.summary.totalExpenses });
    data.push({ Section: 'SUMMARY', Label: 'Total Income', Value: this.report.summary.totalIncome });
    data.push({ Section: 'SUMMARY', Label: 'Net Profit', Value: this.report.summary.netProfit });
    data.push({ Section: 'SUMMARY', Label: 'Avg Expense Per Customer', Value: this.report.summary.averageExpensePerCustomer });

    this.report.countryBreakdown.forEach((cb) => {
      data.push({
        Section: `COUNTRY - ${cb.countryName}`,
        Label: 'Customer Count',
        Value: cb.customerCount,
      });
      data.push({
        Section: `COUNTRY - ${cb.countryName}`,
        Label: 'Total Expenses',
        Value: cb.totalExpenses,
      });
      data.push({
        Section: `COUNTRY - ${cb.countryName}`,
        Label: 'Total Income',
        Value: cb.totalIncome,
      });
      data.push({
        Section: `COUNTRY - ${cb.countryName}`,
        Label: 'Net Profit',
        Value: cb.netProfit,
      });
    });

    this.report.customerDetails.forEach((c) => {
      data.push({
        Section: 'CUSTOMER DETAILS',
        Label: c.customerName,
        Value: `Exp: ${c.totalExpenses}, Inc: ${c.totalIncome}, Country: ${c.countryName}, Location: ${c.locationName}`,
      });
    });

    this.exportService.exportToExcel(data, `Report_${this.report.period}`);
    this.toasterService.success('Report exported to Excel');
  }

  exportToCsv(): void {
    if (!this.report) return;

    const data: any[] = [];

    data.push({ Section: 'SUMMARY', Label: 'Total Customers', Value: this.report.summary.totalCustomers });
    data.push({ Section: 'SUMMARY', Label: 'Total Expenses', Value: this.report.summary.totalExpenses });
    data.push({ Section: 'SUMMARY', Label: 'Total Income', Value: this.report.summary.totalIncome });
    data.push({ Section: 'SUMMARY', Label: 'Net Profit', Value: this.report.summary.netProfit });

    this.report.countryBreakdown.forEach((cb) => {
      data.push({
        Section: `COUNTRY - ${cb.countryName}`,
        Label: 'Customer Count',
        Value: cb.customerCount,
      });
    });

    this.exportService.exportToCsv(data, `Report_${this.report.period}`);
    this.toasterService.success('Report exported to CSV');
  }
}
