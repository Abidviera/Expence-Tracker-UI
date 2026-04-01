import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../../services/report.service';
import { CountryService } from '../../../services/country.service';
import { DateFilterService, FilterKey } from '../../../services/date-filter.service';
import { ExportService } from '../../../services/export.service';
import {
  ReportRequest,
  ReportResponse,
  CountryBreakdown,
  CustomerReportDetail,
} from '../../../models/Country.model';
import { Country, Location } from '../../../models/Country.model';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-report-management',
  standalone: false,
  templateUrl: './report-management.component.html',
  styleUrl: './report-management.component.scss',
})
export class ReportManagementComponent implements OnInit {
  // Expose Math for template use
  Math = Math;

  // ─── State ───
  loading = false;
  hasGenerated = false;
  reportData: ReportResponse | null = null;

  // ─── Filters ───
  selectedFilter: FilterKey = 'thisMonth';
  customFromDate: string = '';
  customToDate: string = '';
  showCustomDates = false;
  filterOptions: { key: FilterKey; label: string }[] = [];
  countries: Country[] = [];
  locations: Location[] = [];
  selectedCountryId: string = '';
  selectedLocationId: string = '';
  activeSection: 'summary' | 'country' | 'location' | 'customer' = 'summary';

  // ─── Chart Types ───
  public barChartType: 'bar' = 'bar';
  public lineChartType: 'line' = 'line';
  public doughnutChartType: 'doughnut' = 'doughnut';

  // ─── Country Bar Chart Data ───
  public countryBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  public countryBarOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#374151',
          font: { size: 11, family: 'Inter, sans-serif', weight: 500 },
          padding: 16,
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 2,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 600, family: 'Inter, sans-serif' },
        bodyFont: { size: 12, family: 'Inter, sans-serif' },
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: $${ctx.parsed.x.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#6b7280',
          font: { size: 10, family: 'Inter, sans-serif' },
          callback: (val) => '$' + Number(val).toLocaleString('en-US', { notation: 'compact' }),
        },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#374151', font: { size: 11, family: 'Inter, sans-serif' } },
        border: { display: false },
      },
    },
    animation: { duration: 1200, easing: 'easeOutQuart' },
  };

  // ─── Profit Line Chart ───
  public profitLineData: ChartData<'line'> = { labels: [], datasets: [] };
  public profitLineOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 600, family: 'Inter, sans-serif' },
        bodyFont: { size: 12, family: 'Inter, sans-serif' },
        callbacks: {
          label: (ctx) => ` Net Profit: $${ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' } }, border: { display: false } },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#6b7280',
          font: { size: 11, family: 'Inter, sans-serif' },
          callback: (val) => '$' + Number(val).toLocaleString('en-US', { notation: 'compact' }),
        },
        border: { display: false, dash: [4, 4] },
      },
    },
    elements: {
      point: { radius: 3, hoverRadius: 7, hoverBorderWidth: 2 },
      line: { tension: 0.4, borderWidth: 3 },
    },
    animation: { duration: 1400, easing: 'easeOutQuart' },
  };

  // ─── Donut Chart Options ───
  public donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#374151',
          font: { size: 11, family: 'Inter, sans-serif' },
          padding: 10,
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 2,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 600, family: 'Inter, sans-serif' },
        bodyFont: { size: 12, family: 'Inter, sans-serif' },
      },
    },
    animation: { animateRotate: true, animateScale: true, duration: 1200, easing: 'easeOutQuart' },
  };

  // ─── Expanded Rows ───
  expandedCountryRows: Set<string> = new Set();
  expandedLocationRows: Set<string> = new Set();
  customerSortField: keyof CustomerReportDetail = 'netProfit';
  customerSortDir: 'asc' | 'desc' = 'desc';

  constructor(
    private reportService: ReportService,
    private countryService: CountryService,
    private dateFilterService: DateFilterService,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    this.filterOptions = this.dateFilterService.options;
    this.loadCountries();
    this.loadLocations();
  }

  loadCountries(): void {
    this.countryService.getActiveCountries().subscribe({
      next: (data) => (this.countries = data),
      error: () => (this.countries = []),
    });
  }

  loadLocations(): void {
    this.countryService.getActiveLocations().subscribe({
      next: (data) => (this.locations = data),
      error: () => (this.locations = []),
    });
  }

  onCountryChange(): void {
    this.selectedLocationId = '';
    if (this.selectedCountryId) {
      this.countryService.getLocationsByCountry(this.selectedCountryId).subscribe({
        next: (data) => (this.locations = data),
        error: () => (this.locations = []),
      });
    } else {
      this.loadLocations();
    }
  }

  onFilterChange(key: FilterKey): void {
    this.selectedFilter = key;
    this.showCustomDates = key === 'custom';
    if (key !== 'custom') {
      this.customFromDate = '';
      this.customToDate = '';
    }
  }

  onCustomDateChange(): void {}

  generateReport(): void {
    this.loading = true;
    this.hasGenerated = false;

    const customFrom = this.selectedFilter === 'custom' && this.customFromDate
      ? new Date(this.customFromDate) : undefined;
    const customTo = this.selectedFilter === 'custom' && this.customToDate
      ? new Date(this.customToDate) : undefined;

    const filterParams = this.dateFilterService.buildParams(this.selectedFilter, customFrom, customTo);

    const request: ReportRequest = {
      filterKey: filterParams.filterKey,
      fromDate: filterParams.fromDate,
      toDate: filterParams.toDate,
      countryId: this.selectedCountryId || undefined,
      locationId: this.selectedLocationId || undefined,
      month: 0,
      year: 0,
    };

    this.reportService.generateReport(request).subscribe({
      next: (data) => {
        this.reportData = data;
        this.hasGenerated = true;
        this.buildCountryBarChart(data.countryBreakdown);
        this.buildProfitDonutChart(data.countryBreakdown);
        this.loading = false;
      },
      error: (err) => {
        console.error('Report generation error:', err);
        this.loading = false;
      },
    });
  }

  // ─── Chart Builders ───

  private buildCountryBarChart(countries: CountryBreakdown[]): void {
    const top = countries.slice(0, 8);
    this.countryBarData = {
      labels: top.map((c) => c.countryName),
      datasets: [
        {
          label: 'Income',
          data: top.map((c) => c.totalIncome),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: '#10b981',
          borderWidth: 0,
          borderRadius: 4,
          barThickness: 14,
        },
        {
          label: 'Expenses',
          data: top.map((c) => c.totalExpenses),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: '#ef4444',
          borderWidth: 0,
          borderRadius: 4,
          barThickness: 14,
        },
      ],
    };
  }

  private buildProfitDonutChart(countries: CountryBreakdown[]): void {
    const palette = [
      '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
    ];
    this.profitDonutData = {
      labels: countries.map((c) => c.countryName),
      datasets: [{
        data: countries.map((c) => c.netProfit),
        backgroundColor: countries.map((_, i) => palette[i % palette.length]),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 3,
      }],
    };
  }

  public profitDonutData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  // ─── Export ───

  exportToPdf(): void {
    if (!this.reportData) return;
    const content = this.buildReportHtml();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  }

  exportToExcel(): void {
    if (!this.reportData) return;
    const rows: (string | number)[][] = [
      ['Financial Report'],
      [''],
      ['Report Title', this.reportData.reportTitle],
      ['Period', this.reportData.period],
      ['Generated By', this.reportData.generatedBy],
      ['Generated On', new Date(this.reportData.generatedOn).toLocaleString()],
      [''],
      ['--- SUMMARY ---'],
      ['Total Customers', this.reportData.summary.totalCustomers],
      ['Total Countries', this.reportData.summary.totalCountries],
      ['Total Locations', this.reportData.summary.totalLocations],
      ['Total Income', this.reportData.summary.totalIncome],
      ['Total Expenses', this.reportData.summary.totalExpenses],
      ['Net Profit', this.reportData.summary.netProfit],
      ['Avg Expense/Customer', this.reportData.summary.averageExpensePerCustomer],
      [''],
      ['--- COUNTRY BREAKDOWN ---'],
      ['Country', 'Code', 'Region', 'Customers', 'Income', 'Expenses', 'Net Profit'],
      ...this.reportData.countryBreakdown.map((c) => [
        c.countryName, c.countryCode, c.region, c.customerCount,
        c.totalIncome, c.totalExpenses, c.netProfit,
      ]),
      [''],
      ['--- LOCATION BREAKDOWN ---'],
      ['Location', 'Country', 'City', 'Customers', 'Income', 'Expenses', 'Net Profit'],
      ...this.reportData.locationBreakdown.map((l) => [
        l.locationName, l.countryName, l.city, l.customerCount,
        l.totalIncome, l.totalExpenses, l.netProfit,
      ]),
      [''],
      ['--- CUSTOMER DETAILS ---'],
      ['Customer', 'Email', 'Country', 'Location', 'Income', 'Expenses', 'Net Profit'],
      ...this.reportData.customerDetails.map((c) => [
        c.customerName, c.email, c.countryName, c.locationName,
        c.totalIncome, c.totalExpenses, c.netProfit,
      ]),
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.exportService.exportToExcel(rows as any[], `Financial-Report-${new Date().toISOString().split('T')[0]}`);
  }

  private buildReportHtml(): string {
    if (!this.reportData) return '';
    const d = this.reportData;
    const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
    return `
      <html><head><title>${d.reportTitle}</title>
      <style>
        body { font-family: Inter, Arial, sans-serif; padding: 40px; color: #1e293b; }
        h1 { color: #5c0733; border-bottom: 2px solid #8c0b4e; padding-bottom: 12px; }
        h2 { color: #334155; margin-top: 32px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
        th { background: #f1f5f9; padding: 8px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
        td { padding: 7px 12px; border-bottom: 1px solid #f1f5f9; }
        .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
        .kpi { background: #f8fafc; border-radius: 10px; padding: 16px; border-left: 4px solid #8c0b4e; }
        .kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
        .kpi-value { font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 4px; }
        .profit { color: #10b981; }
        .loss { color: #ef4444; }
      </style></head><body>
      <h1>${d.reportTitle}</h1>
      <div class="meta">Period: ${d.period} | Generated: ${new Date(d.generatedOn).toLocaleString()} | By: ${d.generatedBy}</div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-label">Total Income</div><div class="kpi-value profit">${fmt(d.summary.totalIncome)}</div></div>
        <div class="kpi"><div class="kpi-label">Total Expenses</div><div class="kpi-value" style="color:#ef4444">${fmt(d.summary.totalExpenses)}</div></div>
        <div class="kpi"><div class="kpi-label">Net Profit</div><div class="kpi-value ${d.summary.netProfit >= 0 ? 'profit' : 'loss'}">${fmt(d.summary.netProfit)}</div></div>
        <div class="kpi"><div class="kpi-label">Avg Expense/Customer</div><div class="kpi-value">${fmt(d.summary.averageExpensePerCustomer)}</div></div>
      </div>
      <h2>Country Breakdown</h2>
      <table><thead><tr><th>Country</th><th>Region</th><th>Customers</th><th>Income</th><th>Expenses</th><th>Net Profit</th></tr></thead><tbody>
        ${d.countryBreakdown.map(c => `<tr>
          <td>${c.countryName} (${c.countryCode})</td><td>${c.region}</td><td>${c.customerCount}</td>
          <td>${fmt(c.totalIncome)}</td><td>${fmt(c.totalExpenses)}</td>
          <td class="${c.netProfit >= 0 ? 'profit' : 'loss'}">${fmt(c.netProfit)}</td></tr>`).join('')}
      </tbody></table>
      <h2>Location Breakdown</h2>
      <table><thead><tr><th>Location</th><th>Country</th><th>City</th><th>Customers</th><th>Income</th><th>Expenses</th><th>Net Profit</th></tr></thead><tbody>
        ${d.locationBreakdown.map(l => `<tr>
          <td>${l.locationName}</td><td>${l.countryName}</td><td>${l.city}</td><td>${l.customerCount}</td>
          <td>${fmt(l.totalIncome)}</td><td>${fmt(l.totalExpenses)}</td>
          <td class="${l.netProfit >= 0 ? 'profit' : 'loss'}">${fmt(l.netProfit)}</td></tr>`).join('')}
      </tbody></table>
      <h2>Customer Details</h2>
      <table><thead><tr><th>Customer</th><th>Email</th><th>Country</th><th>Location</th><th>Income</th><th>Expenses</th><th>Net Profit</th></tr></thead><tbody>
        ${d.customerDetails.map(c => `<tr>
          <td>${c.customerName}</td><td>${c.email}</td><td>${c.countryName}</td><td>${c.locationName}</td>
          <td>${fmt(c.totalIncome)}</td><td>${fmt(c.totalExpenses)}</td>
          <td class="${c.netProfit >= 0 ? 'profit' : 'loss'}">${fmt(c.netProfit)}</td></tr>`).join('')}
      </tbody></table>
      </body></html>`;
  }

  // ─── Row Expand/Collapse ───

  toggleCountryRow(countryName: string): void {
    if (this.expandedCountryRows.has(countryName)) {
      this.expandedCountryRows.delete(countryName);
    } else {
      this.expandedCountryRows.add(countryName);
    }
  }

  toggleLocationRow(locationName: string): void {
    if (this.expandedLocationRows.has(locationName)) {
      this.expandedLocationRows.delete(locationName);
    } else {
      this.expandedLocationRows.add(locationName);
    }
  }

  isCountryExpanded(countryName: string): boolean {
    return this.expandedCountryRows.has(countryName);
  }

  isLocationExpanded(locationName: string): boolean {
    return this.expandedLocationRows.has(locationName);
  }

  // ─── Sort ───

  sortCustomers(field: keyof CustomerReportDetail): void {
    if (this.customerSortField === field) {
      this.customerSortDir = this.customerSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.customerSortField = field;
      this.customerSortDir = 'desc';
    }
  }

  getSortedCustomers(): CustomerReportDetail[] {
    if (!this.reportData) return [];
    const data = [...this.reportData.customerDetails];
    return data.sort((a, b) => {
      const av = a[this.customerSortField];
      const bv = b[this.customerSortField];
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return this.customerSortDir === 'asc' ? cmp : -cmp;
    });
  }

  getSortIcon(field: keyof CustomerReportDetail): string {
    if (this.customerSortField !== field) return 'fa-sort';
    return this.customerSortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // ─── Accessors ───

  formatCurrency(amount: number): string {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatAmount(amount: number): string {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  getReportMeta(): { title: string; period: string; by: string; date: string } | null {
    if (!this.reportData) return null;
    return {
      title: this.reportData.reportTitle,
      period: this.reportData.period,
      by: this.reportData.generatedBy,
      date: new Date(this.reportData.generatedOn).toLocaleString(),
    };
  }

  getSummary() { return this.reportData?.summary; }
  getCountryBreakdown() { return this.reportData?.countryBreakdown ?? []; }
  getLocationBreakdown() { return this.reportData?.locationBreakdown ?? []; }
  hasCountryData() { return (this.reportData?.countryBreakdown?.length ?? 0) > 0; }
  hasLocationData() { return (this.reportData?.locationBreakdown?.length ?? 0) > 0; }
  hasCustomerData() { return (this.reportData?.customerDetails?.length ?? 0) > 0; }

  getTopCountries(count: number): CountryBreakdown[] {
    return (this.reportData?.countryBreakdown ?? []).slice(0, count);
  }

  isProfitable(amount: number): boolean { return amount >= 0; }
}
