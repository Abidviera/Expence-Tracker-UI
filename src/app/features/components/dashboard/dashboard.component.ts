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
  ScriptableContext,
} from 'chart.js';

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
  loading = true;

  selectedFilter: FilterKey = 'thisMonth';
  customFromDate: string = '';
  customToDate: string = '';
  showCustomDates = false;
  filterOptions: { key: FilterKey; label: string }[] = [];

  // ─── Chart Types ───
  public barChartType: 'bar' = 'bar';
  public lineChartType: 'line' = 'line';
  public incomeDonutType: 'doughnut' = 'doughnut';
  public expenseDonutType: 'doughnut' = 'doughnut';
  public radarChartType: 'radar' = 'radar';

  // ─── Chart Data ───
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  public incomeDonutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public expenseDonutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public radarChartData: ChartData<'radar'> = { labels: [], datasets: [] };

  // ─── Bar Chart Options (Income vs Expenses) ───
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
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
            const val = ctx.parsed.y;
            return ` ${ctx.dataset.label}: $${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
        ticks: {
          color: '#6b7280',
          font: { size: 11, family: 'Inter, sans-serif' },
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        grid: { color: '#f1f5f9', lineWidth: 1 },
        ticks: {
          color: '#6b7280',
          font: { size: 11, family: 'Inter, sans-serif' },
          callback: (val) => '$' + Number(val).toLocaleString('en-US', { notation: 'compact' }),
        },
        border: { display: false, dash: [4, 4] },
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
    },
  };

  // ─── Line Chart Options (Net Profit Trend) ───
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
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
      x: {
        grid: { display: false },
        ticks: {
          color: '#6b7280',
          font: { size: 11, family: 'Inter, sans-serif' },
          maxRotation: 0,
        },
        border: { display: false },
      },
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
      point: {
        radius: 3,
        hoverRadius: 7,
        hoverBorderWidth: 2,
      },
      line: {
        tension: 0.4,
        borderWidth: 3,
      },
    },
    animation: {
      duration: 1400,
      easing: 'easeOutQuart',
    },
  };

  // ─── Donut Chart Options (Category Breakdown) ───
  public donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#374151',
          font: { size: 11, family: 'Inter, sans-serif', weight: 400 },
          padding: 12,
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
          label: (ctx: { parsed: number; label: string }) => ` $${ctx.parsed.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${ctx.label})`,
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: 'easeOutQuart',
    },
  };

  // ─── Area Bar Chart (profit area bar) ───
  public areaBarChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public areaBarChartOptions: ChartConfiguration['options'] = {
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
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11, family: 'Inter, sans-serif' }, maxRotation: 0 },
        border: { display: false },
      },
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
    animation: { duration: 1000, easing: 'easeOutQuart' },
  };

  // ─── Radar Chart Data ───
  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#374151',
          font: { size: 11, family: 'Inter, sans-serif' },
          padding: 12,
          boxWidth: 10,
          usePointStyle: true,
        },
      },
    },
    scales: {
      r: {
        grid: { color: '#f1f5f9' },
        angleLines: { color: '#f1f5f9' },
        ticks: {
          color: '#6b7280',
          font: { size: 10, family: 'Inter, sans-serif' },
          backdropColor: 'transparent',
        },
        pointLabels: {
          color: '#374151',
          font: { size: 11, family: 'Inter, sans-serif' },
        },
      },
    },
    animation: { duration: 1200, easing: 'easeOutQuart' },
  };

  constructor(
    private commonUtil: CommonUtil,
    private dashboardService: DashboardService,
    private dateFilterService: DateFilterService,
  ) {}

  ngOnInit(): void {
    this.user = this.commonUtil.getCurrentUser();
    this.filterOptions = this.dateFilterService.options;
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    const customFrom = this.selectedFilter === 'custom' && this.customFromDate
      ? new Date(this.customFromDate) : undefined;
    const customTo = this.selectedFilter === 'custom' && this.customToDate
      ? new Date(this.customToDate) : undefined;
    const filterParams = this.dateFilterService.buildParams(this.selectedFilter, customFrom, customTo);

    this.dashboardService.getDashboardData(filterParams).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.buildBarChart(data.profitTrend);
        this.buildLineChart(data.profitTrend);
        this.buildIncomeDonutChart(data.incomeByCategory);
        this.buildExpenseDonutChart(data.expensesByCategory);
        this.buildRadarChart(data.profitTrend);
        this.loading = false;
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.loading = false;
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
    this.loadDashboardData();
  }

  onCustomDateChange(): void {
    if (this.customFromDate && this.customToDate) {
      this.loadDashboardData();
    }
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  // ─── Chart Builders ───

  private buildBarChart(trend: ProfitTrend[]): void {
    this.barChartData = {
      labels: trend.map((t) => t.month),
      datasets: [
        {
          label: 'Income',
          data: trend.map((t) => t.income),
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderColor: '#10b981',
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.5,
          categoryPercentage: 0.7,
        },
        {
          label: 'Expenses',
          data: trend.map((t) => t.expense),
          backgroundColor: 'rgba(239, 68, 68, 0.75)',
          borderColor: '#ef4444',
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.5,
          categoryPercentage: 0.7,
        },
      ],
    };
  }

  private buildLineChart(trend: ProfitTrend[]): void {
    this.lineChartData = {
      labels: trend.map((t) => t.month),
      datasets: [
        {
          label: 'Net Profit',
          data: trend.map((t) => t.profit),
          borderColor: '#7c3aed',
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'rgba(124, 58, 237, 0.05)';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
            gradient.addColorStop(1, 'rgba(124, 58, 237, 0.01)');
            return gradient;
          },
          fill: true,
          pointBackgroundColor: '#7c3aed',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
      ],
    };
  }

  private buildIncomeDonutChart(categories: CategoryBreakdown[]): void {
    this.incomeDonutData = {
      labels: categories.map((c) => c.categoryName),
      datasets: [
        {
          data: categories.map((c) => c.totalAmount),
          backgroundColor: this.incomeColorPalette(categories.length),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 3,
        },
      ],
    };
  }

  private buildExpenseDonutChart(categories: CategoryBreakdown[]): void {
    this.expenseDonutData = {
      labels: categories.map((c) => c.categoryName),
      datasets: [
        {
          data: categories.map((c) => c.totalAmount),
          backgroundColor: this.expenseColorPalette(categories.length),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 3,
        },
      ],
    };
  }

  private buildRadarChart(trend: ProfitTrend[]): void {
    this.radarChartData = {
      labels: trend.map((t) => t.month),
      datasets: [
        {
          label: 'Income',
          data: trend.map((t) => t.income),
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: '#10b981',
          borderWidth: 2,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointRadius: 4,
        },
        {
          label: 'Expenses',
          data: trend.map((t) => t.expense),
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: '#ef4444',
          borderWidth: 2,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#fff',
          pointRadius: 4,
        },
      ],
    };
  }

  // ─── Color Palettes ───

  private incomeColorPalette(count: number): string[] {
    const palette = [
      '#10b981', '#059669', '#34d399', '#6ee7b7',
      '#a7f3d0', '#047857', '#065f46', '#064e3b',
      '#047857', '#34d399', '#6ee7b7', '#10b981',
    ];
    return palette.slice(0, count);
  }

  private expenseColorPalette(count: number): string[] {
    const palette = [
      '#ef4444', '#f97316', '#f59e0b', '#fbbf24',
      '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
      '#ea580c', '#c2410c', '#fca5a5', '#fecaca',
    ];
    return palette.slice(0, count);
  }

  // ─── Accessors ───

  formatCurrency(amount: number | undefined): string {
    if (amount == null) return '$0.00';
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatAmount(amount: number | undefined): string {
    if (amount == null) return '$0';
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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
    switch (status ? status.toLowerCase() : '') {
      case 'paid': case 'completed': case 'approved': return 'status-approved';
      case 'partial': case 'ongoing': return 'status-pending';
      case 'unpaid': case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
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
    const colors = type === 'income'
      ? ['ic-green-1', 'ic-green-2', 'ic-green-3', 'ic-green-4', 'ic-green-5', 'ic-green-6']
      : ['ic-red-1', 'ic-red-2', 'ic-red-3', 'ic-red-4', 'ic-red-5', 'ic-red-6'];
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
    if (!this.dashboardData) return '$0';
    const remaining = Math.max(this.dashboardData.totalIncome - this.dashboardData.totalExpenses, 0);
    return this.formatAmount(remaining);
  }

  getRecentTransactions(): RecentTransaction[] {
    return this.dashboardData ? this.dashboardData.recentTransactions : [];
  }

  hasData(): boolean {
    return !this.loading && this.dashboardData !== null;
  }

  getTotalIncome(): number { return this.dashboardData?.totalIncome ?? 0; }
  getTotalExpenses(): number { return this.dashboardData?.totalExpenses ?? 0; }
  getNetProfit(): number { return this.dashboardData?.netProfit ?? 0; }
  getTotalCustomers(): number { return this.dashboardData?.totalCustomers ?? 0; }
  getPendingApprovals(): number { return this.dashboardData?.pendingApprovals ?? 0; }
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
}
