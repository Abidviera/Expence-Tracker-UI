import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonUtil } from '../../../shared/utilities/CommonUtil';
import { UserResponseDto } from '../../../auth/components/login/Interfaces/LoginResponse';
import {
  DashboardService,
  DashboardData,
  ProfitTrend,
  CategoryBreakdown,
  RecentTransaction,
} from '../../../services/dashboard.service';
import { DateFilterService, FilterKey } from '../../../services/date-filter.service';
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartConfiguration,
  ChartData,
  ChartType,
  ScriptableContext,
} from 'chart.js';
import {
  AnalyticsService,
  AnalyticsResponse,
  CountryOverview,
  CountryMetric,
  LocationOverview,
  LocationMetric,
  CategoryProfitability,
  CategoryProfitMetric,
  CustomerLifetimeValue,
  CustomerClv,
  TopCustomers,
  TopCustomer,
  TopExpenses,
  TopExpense,
  RecurringVsOneTime,
  GrowthRate,
  Anomaly,
  AnomalyDetection,
  PaymentStatusOverview,
  ExpenseHeatmap,
  BudgetVsActual,
  TopIncomeSources,
  TopIncomeSource,
  CategoryBudget,
  DayOfWeekMetric,
  HourlyMetric,
  QuickInsights,
} from '../../../services/analytics.service';
import { CurrencyService } from '../../../services/currency.service';
import { CurrencyFormatService } from '../../../services/currency-format.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  user: UserResponseDto | null = null;
  dashboardData: DashboardData | null = null;
  analyticsData: AnalyticsResponse | null = null;
  loading = true;

  selectedFilter: FilterKey = 'thisMonth';
  customFromDate: string = '';
  customToDate: string = '';
  showCustomDates = false;
  filterOptions: { key: FilterKey; label: string }[] = [];

  // ─── Active tab for analytics sections ───
  activeAnalyticsTab: string = 'overview';
  activeCountryTab: string = 'chart';
  activeLocationTab: string = 'chart';
  activeCategoryTab: string = 'chart';
  activeClvTab: string = 'chart';
  activeTopExpensesTab: string = 'amount';
  activeAnomalyTab: string = 'list';

  // ─── Chart Types ───
  public barChartType: 'bar' = 'bar';
  public lineChartType: 'line' = 'line';
  public incomeDonutType: 'doughnut' = 'doughnut';
  public expenseDonutType: 'doughnut' = 'doughnut';
  public radarChartType: 'radar' = 'radar';
  public polarAreaType: 'polarArea' = 'polarArea';
  public bubbleChartType: 'bubble' = 'bubble';
  public horizontalBarType: 'bar' = 'bar';

  // ─── Chart Data ───
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  public incomeDonutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public expenseDonutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public radarChartData: ChartData<'radar'> = { labels: [], datasets: [] };

  // ─── New Analytics Charts ───
  public countryBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  public countryPolarData: ChartData<'polarArea'> = { labels: [], datasets: [] };
  public locationBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  public categoryProfitBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  public categoryPolarData: ChartData<'polarArea'> = { labels: [], datasets: [] };
  public clvBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  public topCustomersData: ChartData<'bar'> = { labels: [], datasets: [] };
  public topExpensesData: ChartData<'bar'> = { labels: [], datasets: [] };
  public recurringPieData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public recurringTrendData: ChartData<'line'> = { labels: [], datasets: [] };
  public growthLineData: ChartData<'line'> = { labels: [], datasets: [] };
  public heatmapDayData: ChartData<'bar'> = { labels: [], datasets: [] };
  public heatmapHourData: ChartData<'bar'> = { labels: [], datasets: [] };
  public budgetBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  public paymentPieData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public topIncomeData: ChartData<'bar'> = { labels: [], datasets: [] };
  public anomalyBarData: ChartData<'bar'> = { labels: [], datasets: [] };

  // ─── Common Chart Options Factory ───
  private baseChartOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: '#374151',
            font: { size: 12, family: 'Inter, sans-serif', weight: 500 },
            padding: 20,
            boxWidth: 12,
            boxHeight: 12,
            borderRadius: 3,
            usePointStyle: true,
            pointStyle: 'rectRounded',
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
            label: (ctx) => {
              const val = ctx.parsed.y ?? ctx.parsed;
              return ` ${ctx.dataset.label}: ${this.currencyFormatService.format(val as number)}`;
            },
          },
        },
      },
      scales: {
        x: { stacked: false, grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, maxRotation: 0 }, border: { display: false } },
        y: { grid: { color: '#f1f5f9', lineWidth: 1 }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, callback: (val) => this.currencyFormatService.formatCompact(val as number) }, border: { display: false, dash: [4, 4] } },
      },
      animation: { duration: 1200, easing: 'easeOutQuart' },
    };
  }

  private yAxisOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#cbd5e1',
          borderColor: '#334155', borderWidth: 1, padding: 12, cornerRadius: 8,
          titleFont: { size: 13, weight: 600, family: 'Inter, sans-serif' },
          bodyFont: { size: 12, family: 'Inter, sans-serif' },
          callbacks: { label: (ctx) => ` ${this.currencyFormatService.format(ctx.parsed.y)}` },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, maxRotation: 0 }, border: { display: false } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, callback: (val) => this.currencyFormatService.formatCompact(val as number) }, border: { display: false, dash: [4, 4] } },
      },
      animation: { duration: 1200, easing: 'easeOutQuart' },
    };
  }

  // ─── Bar Chart Options (Income vs Expenses) ───
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true, position: 'top', align: 'end',
        labels: { color: '#374151', font: { size: 12, family: 'Inter, sans-serif', weight: 500 }, padding: 20, boxWidth: 12, boxHeight: 12, borderRadius: 3, usePointStyle: true, pointStyle: 'rectRounded' },
      },
      tooltip: {
        backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#cbd5e1',
        borderColor: '#334155', borderWidth: 1, padding: 12, cornerRadius: 8,
        titleFont: { size: 13, weight: 600, family: 'Inter, sans-serif' },
        bodyFont: { size: 12, family: 'Inter, sans-serif' },
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${this.currencyFormatService.format(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { stacked: false, grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, maxRotation: 0 }, border: { display: false } },
      y: { grid: { color: '#f1f5f9', lineWidth: 1 }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, callback: (val) => this.currencyFormatService.formatCompact(val as number) }, border: { display: false, dash: [4, 4] } },
    },
    animation: { duration: 1200, easing: 'easeOutQuart' },
  };

  // ─── Line Chart Options (Net Profit Trend) ───
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, padding: 12, cornerRadius: 8, titleFont: { size: 13, weight: 600, family: 'Inter, sans-serif' }, bodyFont: { size: 12, family: 'Inter, sans-serif' }, callbacks: { label: (ctx) => ` Net Profit: ${this.currencyFormatService.format(ctx.parsed.y)}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, maxRotation: 0 }, border: { display: false } },
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, callback: (val) => this.currencyFormatService.formatCompact(val as number) }, border: { display: false, dash: [4, 4] } },
    },
    elements: { point: { radius: 3, hoverRadius: 7, hoverBorderWidth: 2 }, line: { tension: 0.4, borderWidth: 3 } },
    animation: { duration: 1400, easing: 'easeOutQuart' },
  };

  // ─── Donut Chart Options ───
  public donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false, cutout: '72%',
    plugins: {
      legend: { display: true, position: 'bottom', labels: { color: '#374151', font: { size: 11, family: 'Inter, sans-serif', weight: 400 }, padding: 12, boxWidth: 10, boxHeight: 10, borderRadius: 2, usePointStyle: true } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, padding: 12, cornerRadius: 8, titleFont: { size: 13, weight: 600, family: 'Inter, sans-serif' }, bodyFont: { size: 12, family: 'Inter, sans-serif' }, callbacks: { label: (ctx: { parsed: number; label: string }) => ` ${this.currencyFormatService.format(ctx.parsed)} (${ctx.label})` } },
    },
    animation: { animateRotate: true, animateScale: true, duration: 1200, easing: 'easeOutQuart' },
  };

  // ─── Horizontal Bar Chart Options ───
  public horizontalBarOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, padding: 12, cornerRadius: 8, titleFont: { size: 13, weight: 600, family: 'Inter, sans-serif' }, bodyFont: { size: 12, family: 'Inter, sans-serif' }, callbacks: { label: (ctx) => ` ${this.currencyFormatService.format(ctx.parsed.x)}` } },
    },
    scales: {
      x: { grid: { color: '#f1f5f9' }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, callback: (val) => this.currencyFormatService.formatCompact(val as number) }, border: { display: false } },
      y: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' } }, border: { display: false } },
    },
    animation: { duration: 1200, easing: 'easeOutQuart' },
  };

  // ─── Polar Area Chart Options ───
  public polarAreaOptions: ChartConfiguration<'polarArea'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right', labels: { color: '#374151', font: { size: 11, family: 'Inter, sans-serif' }, padding: 12, usePointStyle: true } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, padding: 12, cornerRadius: 8, titleFont: { size: 13, weight: 600, family: 'Inter, sans-serif' }, bodyFont: { size: 12, family: 'Inter, sans-serif' }, callbacks: { label: (ctx) => ` ${this.currencyFormatService.format(ctx.parsed.r)}` } },
    },
    animation: { duration: 1200, easing: 'easeOutQuart' },
  };

  // ─── Area Bar Chart (profit area bar) ───
  public areaBarChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public areaBarChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, padding: 12, cornerRadius: 8, titleFont: { size: 13, weight: 600, family: 'Inter, sans-serif' }, bodyFont: { size: 12, family: 'Inter, sans-serif' } } },
    scales: { x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, maxRotation: 0 }, border: { display: false } }, y: { grid: { color: '#f1f5f9' }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, callback: (val) => this.currencyFormatService.formatCompact(val as number) }, border: { display: false, dash: [4, 4] } } },
    animation: { duration: 1000, easing: 'easeOutQuart' },
  };

  // ─── Radar Chart Options ───
  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top', labels: { color: '#374151', font: { size: 11, family: 'Inter, sans-serif' }, padding: 12, boxWidth: 10, usePointStyle: true } } },
    scales: { r: { grid: { color: '#f1f5f9' }, angleLines: { color: '#f1f5f9' }, ticks: { color: '#6b7280', font: { size: 10, family: 'Inter, sans-serif' }, backdropColor: 'transparent' }, pointLabels: { color: '#374151', font: { size: 11, family: 'Inter, sans-serif' } } } },
    animation: { duration: 1200, easing: 'easeOutQuart' },
  };

  // ─── Stacked Bar Chart Options ───
  public stackedBarOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: '#374151', font: { size: 11, family: 'Inter, sans-serif' }, padding: 16, usePointStyle: true } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, padding: 12, cornerRadius: 8, titleFont: { size: 13, weight: 600, family: 'Inter, sans-serif' }, bodyFont: { size: 12, family: 'Inter, sans-serif' } },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, maxRotation: 0 }, border: { display: false } },
      y: { stacked: true, grid: { color: '#f1f5f9' }, ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, callback: (val) => this.currencyFormatService.formatCompact(val as number) }, border: { display: false } },
    },
    animation: { duration: 1200, easing: 'easeOutQuart' },
  };

  constructor(
    private commonUtil: CommonUtil,
    private dashboardService: DashboardService,
    private analyticsService: AnalyticsService,
    private dateFilterService: DateFilterService,
    private currencyService: CurrencyService,
    private currencyFormatService: CurrencyFormatService,
  ) {}

  ngOnInit(): void {
    this.user = this.commonUtil.getCurrentUser();
    this.filterOptions = this.dateFilterService.options;
    this.loadActiveCurrency();
    this.loadAllData();
  }

  private loadActiveCurrency(): void {
    this.currencyService.getActiveCurrencies().subscribe({
      next: (currencies) => {
        if (currencies && currencies.length > 0) {
          this.currencyFormatService.setActiveCurrency(currencies[0]);
        }
      },
      error: () => {
        // No active currency available — amounts will display without symbol
      },
    });
  }

  loadAllData(): void {
    this.loading = true;
    const customFrom = this.selectedFilter === 'custom' && this.customFromDate ? new Date(this.customFromDate) : undefined;
    const customTo = this.selectedFilter === 'custom' && this.customToDate ? new Date(this.customToDate) : undefined;
    const filterParams = this.dateFilterService.buildParams(this.selectedFilter, customFrom, customTo);

    // Load both dashboard and analytics in parallel
    this.dashboardService.getDashboardData(filterParams).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.buildBarChart(data.profitTrend);
        this.buildLineChart(data.profitTrend);
        this.buildIncomeDonutChart(data.incomeByCategory);
        this.buildExpenseDonutChart(data.expensesByCategory);
        this.buildRadarChart(data.profitTrend);
      },
      error: (err) => console.error('Dashboard load error:', err),
    });

    this.analyticsService.getAnalyticsData(filterParams).subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.buildAnalyticsCharts(data);
        this.loading = false;
      },
      error: (err) => {
        const msg = err?.error?.error ?? err?.message ?? JSON.stringify(err);
        console.error('Analytics load error:', msg, 'Status:', err?.status, 'URL:', err?.url);
        this.loading = false;
      },
    });
  }

  loadDashboardData(): void {
    this.loadAllData();
  }

  onFilterChange(key: FilterKey): void {
    this.selectedFilter = key;
    this.showCustomDates = key === 'custom';
    if (key !== 'custom') {
      this.customFromDate = '';
      this.customToDate = '';
    }
    this.loadAllData();
  }

  onCustomDateChange(): void {
    if (this.customFromDate && this.customToDate) {
      this.loadAllData();
    }
  }

  refreshData(): void {
    this.loadAllData();
  }

  // ─── Existing Chart Builders ───
  private buildBarChart(trend: ProfitTrend[]): void {
    this.barChartData = {
      labels: trend.map((t) => t.month),
      datasets: [
        { label: 'Income', data: trend.map((t) => t.income), backgroundColor: 'rgba(16, 185, 129, 0.85)', borderColor: '#10b981', borderWidth: 0, borderRadius: 6, borderSkipped: false, barPercentage: 0.5, categoryPercentage: 0.7 },
        { label: 'Expenses', data: trend.map((t) => t.expense), backgroundColor: 'rgba(239, 68, 68, 0.75)', borderColor: '#ef4444', borderWidth: 0, borderRadius: 6, borderSkipped: false, barPercentage: 0.5, categoryPercentage: 0.7 },
      ],
    };
  }

  private buildLineChart(trend: ProfitTrend[]): void {
    this.lineChartData = {
      labels: trend.map((t) => t.month),
      datasets: [{
        label: 'Net Profit', data: trend.map((t) => t.profit),
        borderColor: '#7c3aed',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const chart = context.chart; const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(124, 58, 237, 0.05)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
          gradient.addColorStop(1, 'rgba(124, 58, 237, 0.01)');
          return gradient;
        },
        fill: true, pointBackgroundColor: '#7c3aed', pointBorderColor: '#ffffff', pointBorderWidth: 2,
      }],
    };
  }

  private buildIncomeDonutChart(categories: CategoryBreakdown[]): void {
    this.incomeDonutData = {
      labels: categories.map((c) => c.categoryName),
      datasets: [{ data: categories.map((c) => c.totalAmount), backgroundColor: this.incomeColorPalette(categories.length), borderColor: '#ffffff', borderWidth: 3, hoverBorderWidth: 3 }],
    };
  }

  private buildExpenseDonutChart(categories: CategoryBreakdown[]): void {
    this.expenseDonutData = {
      labels: categories.map((c) => c.categoryName),
      datasets: [{ data: categories.map((c) => c.totalAmount), backgroundColor: this.expenseColorPalette(categories.length), borderColor: '#ffffff', borderWidth: 3, hoverBorderWidth: 3 }],
    };
  }

  private buildRadarChart(trend: ProfitTrend[]): void {
    this.radarChartData = {
      labels: trend.map((t) => t.month),
      datasets: [
        { label: 'Income', data: trend.map((t) => t.income), backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981', borderWidth: 2, pointBackgroundColor: '#10b981', pointBorderColor: '#fff', pointRadius: 4 },
        { label: 'Expenses', data: trend.map((t) => t.expense), backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444', borderWidth: 2, pointBackgroundColor: '#ef4444', pointBorderColor: '#fff', pointRadius: 4 },
      ],
    };
  }

  // ─── New Analytics Chart Builders ───
  private buildAnalyticsCharts(data: AnalyticsResponse): void {
    this.buildCountryChart(data.countryOverview);
    this.buildLocationChart(data.locationOverview);
    this.buildCategoryProfitChart(data.categoryProfitability);
    this.buildClvChart(data.customerLifetimeValue);
    this.buildTopCustomersChart(data.topCustomers);
    this.buildTopExpensesChart(data.topExpenses);
    this.buildRecurringChart(data.recurringVsOneTime);
    this.buildGrowthChart(data.growthRate);
    this.buildHeatmapCharts(data.expenseHeatmap);
    this.buildBudgetChart(data.budgetVsActual);
    this.buildPaymentStatusChart(data.paymentStatusOverview);
    this.buildTopIncomeChart(data.topIncomeSources);
  }

  private buildCountryChart(data: CountryOverview): void {
    if (!data.countries?.length) return;
    const top10 = data.countries.slice(0, 10);
    this.countryBarData = {
      labels: top10.map((c: CountryMetric) => c.countryName),
      datasets: [
        { label: 'Income', data: top10.map((c: CountryMetric) => c.totalIncome), backgroundColor: 'rgba(16, 185, 129, 0.8)', borderRadius: 4 },
        { label: 'Expenses', data: top10.map((c: CountryMetric) => c.totalExpenses), backgroundColor: 'rgba(239, 68, 68, 0.7)', borderRadius: 4 },
      ],
    };
    this.countryPolarData = {
      labels: top10.map((c: CountryMetric) => c.countryName),
      datasets: [{ data: top10.map((c: CountryMetric) => Math.abs(c.netProfit)), backgroundColor: this.profitColorPalette(top10.length), borderWidth: 2 }],
    };
  }

  private buildLocationChart(data: LocationOverview): void {
    if (!data.locations?.length) return;
    const top10 = data.locations.slice(0, 10);
    this.locationBarData = {
      labels: top10.map((l: LocationMetric) => l.locationName),
      datasets: [
        { label: 'Income', data: top10.map((l: LocationMetric) => l.totalIncome), backgroundColor: 'rgba(16, 185, 129, 0.8)', borderRadius: 4 },
        { label: 'Expenses', data: top10.map((l: LocationMetric) => l.totalExpenses), backgroundColor: 'rgba(239, 68, 68, 0.7)', borderRadius: 4 },
        { label: 'Net Profit', data: top10.map((l: LocationMetric) => l.netProfit), backgroundColor: 'rgba(124, 58, 237, 0.6)', borderRadius: 4 },
      ],
    };
  }

  private buildCategoryProfitChart(data: CategoryProfitability): void {
    if (!data.categories?.length) return;
    const cats = data.categories.slice(0, 12);
    this.categoryProfitBarData = {
      labels: cats.map((c: CategoryProfitMetric) => c.categoryName),
      datasets: [
        { label: 'Income', data: cats.map((c: CategoryProfitMetric) => c.incomeAmount), backgroundColor: 'rgba(16, 185, 129, 0.85)', borderRadius: 4 },
        { label: 'Expenses', data: cats.map((c: CategoryProfitMetric) => c.expenseAmount), backgroundColor: 'rgba(239, 68, 68, 0.75)', borderRadius: 4 },
      ],
    };
    this.categoryPolarData = {
      labels: cats.map((c: CategoryProfitMetric) => c.categoryName),
      datasets: [{ data: cats.map((c: CategoryProfitMetric) => Math.abs(c.netProfit)), backgroundColor: this.profitColorPalette(cats.length), borderWidth: 2 }],
    };
  }

  private buildClvChart(data: CustomerLifetimeValue): void {
    if (!data.customers?.length) return;
    const top10 = data.customers.slice(0, 10);
    this.clvBarData = {
      labels: top10.map((c: CustomerClv) => c.customerName),
      datasets: [{
        label: 'Net Contribution', data: top10.map((c: CustomerClv) => c.netContribution),
        backgroundColor: top10.map((c: CustomerClv) => c.netContribution >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
        borderRadius: 4,
      }],
    };
  }

  private buildTopCustomersChart(data: TopCustomers): void {
    if (!data.byRevenue?.length) return;
    const top = data.byRevenue.slice(0, 10);
    this.topCustomersData = {
      labels: top.map((c: TopCustomer) => c.customerName),
      datasets: [{
        label: 'Revenue', data: top.map((c: TopCustomer) => c.value),
        backgroundColor: 'rgba(59, 130, 246, 0.75)', borderRadius: 4,
      }],
    };
  }

  private buildTopExpensesChart(data: TopExpenses): void {
    if (!data.byAmount?.length) return;
    const top = data.byAmount.slice(0, 10);
    this.topExpensesData = {
      labels: top.map((e: TopExpense) => e.title.length > 20 ? e.title.substring(0, 20) + '...' : e.title),
      datasets: [{
        label: 'Amount', data: top.map((e: TopExpense) => e.amount),
        backgroundColor: top.map((e: TopExpense) => e.isAnomaly ? 'rgba(249, 115, 22, 0.8)' : 'rgba(239, 68, 68, 0.75)'),
        borderRadius: 4,
      }],
    };
  }

  private buildRecurringChart(data: RecurringVsOneTime): void {
    if (!data.hasData) return;
    this.recurringPieData = {
      labels: ['Recurring', 'One-time'],
      datasets: [{
        data: [data.recurringCount, data.oneTimeCount],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(99, 102, 241, 0.8)'],
        borderWidth: 3, borderColor: '#ffffff',
      }],
    };
    if (data.monthlyTrend?.length) {
      this.recurringTrendData = {
        labels: data.monthlyTrend.map((m) => m.month),
        datasets: [
          { label: 'Recurring', data: data.monthlyTrend.map((m) => m.recurringAmount), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, borderWidth: 2 },
          { label: 'One-time', data: data.monthlyTrend.map((m) => m.oneTimeAmount), borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4, borderWidth: 2 },
        ],
      };
    }
  }

  private buildGrowthChart(data: GrowthRate): void {
    if (!data.monthlyGrowth?.length) return;
    this.growthLineData = {
      labels: data.monthlyGrowth.map((m) => m.month),
      datasets: [
        { label: 'Income Growth %', data: data.monthlyGrowth.map((m) => m.incomeGrowthPercent), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, borderWidth: 2 },
        { label: 'Expense Growth %', data: data.monthlyGrowth.map((m) => m.expenseGrowthPercent), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4, borderWidth: 2 },
        { label: 'Profit Growth %', data: data.monthlyGrowth.map((m) => m.profitGrowthPercent), borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, 0.1)', fill: true, tension: 0.4, borderWidth: 2 },
      ],
    };
  }

  private buildHeatmapCharts(data: ExpenseHeatmap): void {
    if (!data.byDayOfWeek?.length) return;
    this.heatmapDayData = {
      labels: data.byDayOfWeek.map((d: DayOfWeekMetric) => d.dayName),
      datasets: [{ label: 'Total Expenses', data: data.byDayOfWeek.map((d: DayOfWeekMetric) => d.totalAmount), backgroundColor: data.byDayOfWeek.map((d: DayOfWeekMetric) => this.heatmapColor(d.percentageOfTotal)), borderRadius: 4 }],
    };
    if (data.byHour?.length) {
      this.heatmapHourData = {
        labels: data.byHour.map((h: HourlyMetric) => h.hourLabel),
        datasets: [{ label: 'Expenses by Hour', data: data.byHour.map((h: HourlyMetric) => h.totalAmount), backgroundColor: 'rgba(249, 115, 22, 0.7)', borderRadius: 4 }],
      };
    }
  }

  private buildBudgetChart(data: BudgetVsActual): void {
    if (!data.categories?.length) return;
    const cats = data.categories.slice(0, 10);
    this.budgetBarData = {
      labels: cats.map((c: CategoryBudget) => c.categoryName),
      datasets: [
        { label: 'Budgeted', data: cats.map((c: CategoryBudget) => c.budgetedAmount), backgroundColor: 'rgba(99, 102, 241, 0.6)', borderRadius: 4 },
        { label: 'Actual', data: cats.map((c: CategoryBudget) => c.actualAmount), backgroundColor: cats.map((c: CategoryBudget) => c.status === 'Over Budget' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)'), borderRadius: 4 },
      ],
    };
  }

  private buildPaymentStatusChart(data: PaymentStatusOverview): void {
    if (!data.hasData) return;
    this.paymentPieData = {
      labels: ['Paid', 'Partial', 'Unpaid'],
      datasets: [{
        data: [data.incomeStatus.paidCount, data.incomeStatus.partialCount, data.incomeStatus.unpaidCount],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(249, 115, 22, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderWidth: 3, borderColor: '#ffffff',
      }],
    };
  }

  private buildTopIncomeChart(data: TopIncomeSources): void {
    if (!data.sources?.length) return;
    const top = data.sources.slice(0, 10);
    this.topIncomeData = {
      labels: top.map((s: TopIncomeSource) => s.source.length > 20 ? s.source.substring(0, 20) + '...' : s.source),
      datasets: [{
        label: 'Amount', data: top.map((s: TopIncomeSource) => s.amount),
        backgroundColor: 'rgba(16, 185, 129, 0.75)', borderRadius: 4,
      }],
    };
  }

  // ─── Color Palettes ───
  private incomeColorPalette(count: number): string[] {
    const palette = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#047857', '#065f46', '#064e3b', '#047857', '#34d399', '#6ee7b7', '#10b981'];
    return palette.slice(0, Math.max(count, 1));
  }

  private expenseColorPalette(count: number): string[] {
    const palette = ['#ef4444', '#f97316', '#f59e0b', '#fbbf24', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#ea580c', '#c2410c', '#fca5a5', '#fecaca'];
    return palette.slice(0, Math.max(count, 1));
  }

  private profitColorPalette(count: number): string[] {
    const palette = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#a855f7'];
    return palette.slice(0, Math.max(count, 1));
  }

  private heatmapColor(percentage: number): string {
    if (percentage > 20) return 'rgba(239, 68, 68, 0.85)';
    if (percentage > 15) return 'rgba(249, 115, 22, 0.75)';
    if (percentage > 10) return 'rgba(245, 158, 11, 0.65)';
    if (percentage > 5) return 'rgba(16, 185, 129, 0.55)';
    return 'rgba(16, 185, 129, 0.35)';
  }

  // ─── Utilities ───
  formatCurrency(amount: number | undefined): string {
    return this.currencyFormatService.format(amount);
  }

  formatAmount(amount: number | undefined): string {
    return this.currencyFormatService.formatWhole(amount ?? 0);
  }

  formatCompact(amount: number | undefined): string {
    return this.currencyFormatService.formatCompact(amount);
  }

  formatPercent(value: number | undefined): string {
    if (value == null) return '0%';
    return value.toFixed(1) + '%';
  }

  getChangeClass(change: number): string {
    if (change > 0) return 'trend-up';
    if (change < 0) return 'trend-down';
    return '';
  }

  getChangeIcon(change: number): string {
    if (change > 0) return 'fa-arrow-up';
    if (change < 0) return 'fa-arrow-down';
    return 'fa-minus';
  }

  getStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'paid': case 'completed': case 'approved': return 'status-approved';
      case 'partial': case 'ongoing': return 'status-pending';
      case 'unpaid': case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  getSeverityClass(severity: string): string {
    switch ((severity || '').toLowerCase()) {
      case 'critical': return 'severity-critical';
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return '';
    }
  }

  getClvTierClass(tier: string): string {
    switch ((tier || '').toLowerCase()) {
      case 'platinum': return 'tier-platinum';
      case 'gold': return 'tier-gold';
      case 'silver': return 'tier-silver';
      case 'bronze': return 'tier-bronze';
      default: return '';
    }
  }

  getBudgetStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'over budget': return 'budget-over';
      case 'under budget': return 'budget-under';
      case 'on budget': return 'budget-on';
      default: return '';
    }
  }

  getPerformanceClass(label: string): string {
    switch ((label || '').toLowerCase()) {
      case 'high profit': return 'perf-high';
      case 'loss': return 'perf-loss';
      case 'expense only': return 'perf-expense';
      default: return 'perf-neutral';
    }
  }

  getGrowthClass(value: number): string {
    if (value > 0) return 'growth-positive';
    if (value < 0) return 'growth-negative';
    return 'growth-neutral';
  }

  getCategoryIcon(categoryName: string): string {
    const name = (categoryName || '').toLowerCase();
    if (name.includes('hotel') || name.includes('accommodation')) return 'fa-hotel';
    if (name.includes('flight') || name.includes('travel') || name.includes('transport')) return 'fa-plane';
    if (name.includes('food') || name.includes('meal') || name.includes('dining')) return 'fa-utensils';
    if (name.includes('taxi') || name.includes('car') || name.includes('fuel')) return 'fa-car';
    if (name.includes('shop') || name.includes('retail') || name.includes('purchase')) return 'fa-shopping-bag';
    if (name.includes('salary') || name.includes('wage')) return 'fa-users';
    if (name.includes('utilities') || name.includes('electric') || name.includes('water')) return 'fa-bolt';
    if (name.includes('rent') || name.includes('lease')) return 'fa-home';
    if (name.includes('insurance')) return 'fa-shield-alt';
    if (name.includes('marketing') || name.includes('advert')) return 'fa-bullhorn';
    if (name.includes('software') || name.includes('subscription')) return 'fa-laptop-code';
    return 'fa-tag';
  }

  getCategoryIconClass(index: number, type: 'income' | 'expense'): string {
    const colors = type === 'income' ? ['ic-green-1', 'ic-green-2', 'ic-green-3', 'ic-green-4', 'ic-green-5', 'ic-green-6'] : ['ic-red-1', 'ic-red-2', 'ic-red-3', 'ic-red-4', 'ic-red-5', 'ic-red-6'];
    return colors[index % colors.length];
  }

  getTransactionIconClass(type: string): string {
    return (type || '').toLowerCase() === 'income' ? 'tx-income' : 'tx-expense';
  }

  getBudgetUsedPercent(): number {
    if (!this.dashboardData || this.dashboardData.totalIncome === 0) return 0;
    return Math.min(Math.round((this.dashboardData.totalExpenses / this.dashboardData.totalIncome) * 100), 100);
  }

  getBudgetRemaining(): string {
    if (!this.dashboardData) return '';
    const remaining = Math.max(this.dashboardData.totalIncome - this.dashboardData.totalExpenses, 0);
    return this.formatAmount(remaining);
  }

  getRecentTransactions(): RecentTransaction[] {
    return this.dashboardData ? this.dashboardData.recentTransactions : [];
  }

  hasData(): boolean {
    return !this.loading && this.dashboardData !== null;
  }

  hasAnalyticsData(): boolean {
    return !this.loading && this.analyticsData !== null;
  }

  getTotalIncome(): number { return this.dashboardData?.totalIncome ?? 0; }
  getTotalExpenses(): number { return this.dashboardData?.totalExpenses ?? 0; }
  getNetProfit(): number { return this.dashboardData?.netProfit ?? 0; }
  getTotalCustomers(): number { return this.dashboardData?.totalCustomers ?? 0; }
  getPendingApprovals(): number { return this.dashboardData?.pendingApprovals ?? 0; }
  getTotalOutstandingBalance(): number { return this.dashboardData?.totalOutstandingBalance ?? 0; }
  getIncomeChange(): number { return this.dashboardData?.incomeChangePercent ?? 0; }
  getExpenseChange(): number { return this.dashboardData?.expenseChangePercent ?? 0; }
  hasPendingApprovals(): boolean { return !!(this.dashboardData?.pendingApprovals && this.dashboardData.pendingApprovals > 0); }
  showIncomeChange(): boolean { return (this.dashboardData?.incomeChangePercent ?? 0) !== 0; }
  showExpenseChange(): boolean { return (this.dashboardData?.expenseChangePercent ?? 0) !== 0; }
  isProfitable(): boolean { return !!(this.dashboardData && this.dashboardData.netProfit >= 0); }

  getIncomeCategories(): CategoryBreakdown[] { return this.dashboardData?.incomeByCategory ?? []; }
  getExpenseCategories(): CategoryBreakdown[] { return this.dashboardData?.expensesByCategory ?? []; }
  hasIncomeCategories(): boolean { return (this.dashboardData?.incomeByCategory ?? []).length > 0; }
  hasExpenseCategories(): boolean { return (this.dashboardData?.expensesByCategory ?? []).length > 0; }

  getTodayDate(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  getNetProfitDisplay(): string {
    return this.formatCurrency(this.dashboardData?.netProfit);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  setAnalyticsTab(tab: string): void { this.activeAnalyticsTab = tab; }
  setCountryTab(tab: string): void { this.activeCountryTab = tab; }
  setLocationTab(tab: string): void { this.activeLocationTab = tab; }
  setCategoryTab(tab: string): void { this.activeCategoryTab = tab; }
  setClvTab(tab: string): void { this.activeClvTab = tab; }
  setTopExpensesTab(tab: string): void { this.activeTopExpensesTab = tab; }
  setAnomalyTab(tab: string): void { this.activeAnomalyTab = tab; }

  // ─── Analytics Accessors ───
  getCountryData(): CountryOverview | null { return this.analyticsData?.countryOverview ?? null; }
  getLocationData(): LocationOverview | null { return this.analyticsData?.locationOverview ?? null; }
  getCategoryProfitData(): CategoryProfitability | null { return this.analyticsData?.categoryProfitability ?? null; }
  getClvData(): CustomerLifetimeValue | null { return this.analyticsData?.customerLifetimeValue ?? null; }
  getTopCustomersData(): TopCustomers | null { return this.analyticsData?.topCustomers ?? null; }
  getTopExpensesData(): TopExpenses | null { return this.analyticsData?.topExpenses ?? null; }
  getRecurringData(): RecurringVsOneTime | null { return this.analyticsData?.recurringVsOneTime ?? null; }
  getGrowthData(): GrowthRate | null { return this.analyticsData?.growthRate ?? null; }
  getAnomalyData(): AnomalyDetection | null { return this.analyticsData?.anomalyDetection ?? null; }
  getPaymentData(): PaymentStatusOverview | null { return this.analyticsData?.paymentStatusOverview ?? null; }
  getHeatmapData(): ExpenseHeatmap | null { return this.analyticsData?.expenseHeatmap ?? null; }
  getBudgetData(): BudgetVsActual | null { return this.analyticsData?.budgetVsActual ?? null; }
  getTopIncomeData(): TopIncomeSources | null { return this.analyticsData?.topIncomeSources ?? null; }
  getInsightsData(): QuickInsights | null { return this.analyticsData?.quickInsights ?? null; }

  hasCountryData(): boolean { return !!(this.analyticsData?.countryOverview?.hasData); }
  hasLocationData(): boolean { return !!(this.analyticsData?.locationOverview?.hasData); }
  hasCategoryData(): boolean { return !!(this.analyticsData?.categoryProfitability?.hasData); }
  hasClvData(): boolean { return !!(this.analyticsData?.customerLifetimeValue?.hasData); }
  hasTopCustomersData(): boolean { return !!(this.analyticsData?.topCustomers?.hasData); }
  hasTopExpensesData(): boolean { return !!(this.analyticsData?.topExpenses?.hasData); }
  hasRecurringData(): boolean { return !!(this.analyticsData?.recurringVsOneTime?.hasData); }
  hasGrowthData(): boolean { return !!(this.analyticsData?.growthRate?.monthlyGrowth?.length); }
  hasAnomalyData(): boolean { return !!(this.analyticsData?.anomalyDetection?.hasData); }
  hasPaymentData(): boolean { return !!(this.analyticsData?.paymentStatusOverview?.hasData); }
  hasHeatmapData(): boolean { return !!(this.analyticsData?.expenseHeatmap?.hasData); }
  hasBudgetData(): boolean { return !!(this.analyticsData?.budgetVsActual?.hasData); }
  hasTopIncomeData(): boolean { return !!(this.analyticsData?.topIncomeSources?.hasData); }

  trackByIndex(index: number): number { return index; }
  trackById(index: number, item: { expenseId?: string; incomeId?: string; customerId?: string }): string {
    return item.expenseId || item.incomeId || item.customerId || String(index);
  }
}
