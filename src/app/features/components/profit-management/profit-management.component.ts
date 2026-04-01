import { Component, OnInit } from '@angular/core';
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
import { DateFilterService, FilterKey } from '../../../services/date-filter.service';
import { CurrencyService } from '../../../services/currency.service';
import { CurrencyFormatService } from '../../../services/currency-format.service';

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
    filterKey: 'thisMonth',
    fromDate: '',
    toDate: '',
  };

  report: ReportResponse | null = null;
  isLoading = false;
  hasGenerated = false;

  countries: Country[] = [];
  filteredLocations: Location[] = [];

  // Date filter state
  selectedFilter: FilterKey = 'thisMonth';
  customFromDate: string = '';
  customToDate: string = '';
  showCustomDates = false;
  filterOptions: { key: FilterKey; label: string }[] = [];

  readonly months = [
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
    private exportService: ExportService,
    private dateFilterService: DateFilterService,
    private currencyService: CurrencyService,
    private currencyFormatService: CurrencyFormatService,
  ) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      this.years.push(y);
    }
    this.filterOptions = this.dateFilterService.options;
  }

  ngOnInit(): void {
    this.loadCountries();
    this.loadActiveCurrency();
  }

  private loadActiveCurrency(): void {
    this.currencyService.getActiveCurrencies().subscribe({
      next: (currencies) => {
        if (currencies && currencies.length > 0) {
          this.currencyFormatService.setActiveCurrency(currencies[0]);
        }
      },
      error: () => {},
    });
  }

  private loadCountries(): void {
    this.countryService.getActiveCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
    });
  }

  onFilterChange(key: FilterKey): void {
    this.selectedFilter = key;
    this.showCustomDates = key === 'custom';
    if (key !== 'custom') {
      this.customFromDate = '';
      this.customToDate = '';
    }
  }

  onCustomDateChange(): void {
    // Custom date inputs trigger report generation when both are set
  }

  onCountryChange(countryId: string): void {
    if (countryId) {
      this.reportRequest.countryId = countryId;
      this.countryService.getLocationsByCountry(countryId).subscribe({
        next: (locations) => {
          this.filteredLocations = locations.filter((l) => l.isActive);
        },
      });
    } else {
      this.reportRequest.countryId = undefined;
      this.filteredLocations = [];
    }
    this.reportRequest.locationId = undefined;
  }

  onLocationChange(locationId: string): void {
    this.reportRequest.locationId = locationId || undefined;
  }

  generateReport(): void {
    if (this.selectedFilter === 'custom' && (!this.customFromDate || !this.customToDate)) {
      this.toasterService.error('Please select both From and To dates for custom range.');
      return;
    }

    this.isLoading = true;
    this.hasGenerated = false;
    this.activeSection = 'summary';

    const customFrom = this.customFromDate ? new Date(this.customFromDate) : undefined;
    const customTo = this.customToDate ? new Date(this.customToDate) : undefined;
    const filterParams = this.dateFilterService.buildParams(
      this.selectedFilter,
      customFrom,
      customTo
    );

    const request: ReportRequest = {
      month: this.reportRequest.month,
      year: this.reportRequest.year,
      filterKey: filterParams.filterKey,
      fromDate: filterParams.fromDate,
      toDate: filterParams.toDate,
      countryId: this.reportRequest.countryId,
      locationId: this.reportRequest.locationId,
    };

    this.reportService.generateReport(request).subscribe({
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
    this.selectedFilter = 'thisMonth';
    this.customFromDate = '';
    this.customToDate = '';
    this.showCustomDates = false;
    this.reportRequest = {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      filterKey: 'thisMonth',
      fromDate: '',
      toDate: '',
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
      data.push({ Section: `COUNTRY - ${cb.countryName}`, Label: 'Customer Count', Value: cb.customerCount });
      data.push({ Section: `COUNTRY - ${cb.countryName}`, Label: 'Total Expenses', Value: cb.totalExpenses });
      data.push({ Section: `COUNTRY - ${cb.countryName}`, Label: 'Total Income', Value: cb.totalIncome });
      data.push({ Section: `COUNTRY - ${cb.countryName}`, Label: 'Net Profit', Value: cb.netProfit });
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
      data.push({ Section: `COUNTRY - ${cb.countryName}`, Label: 'Customer Count', Value: cb.customerCount });
    });

    this.exportService.exportToCsv(data, `Report_${this.report.period}`);
    this.toasterService.success('Report exported to CSV');
  }
}
