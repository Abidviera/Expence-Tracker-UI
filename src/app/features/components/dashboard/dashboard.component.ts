import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonUtil } from '../../../shared/utilities/CommonUtil';
import { UserResponseDto } from '../../../auth/components/login/Interfaces/LoginResponse';
import { DashboardService, DashboardData, ProfitTrend, CategoryBreakdown, RecentTransaction } from '../../../services/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  user: UserResponseDto | null = null;
  dashboardData: DashboardData | null = null;
  loading = true;

  public profitChartType: ChartType = 'bar';
  public profitChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public profitChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#64748b', font: { size: 12 }, padding: 15 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#64748b' }
      }
    }
  };

  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#64748b', font: { size: 12 }, padding: 15 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#64748b' }
      }
    }
  };

  public incomeDonutType: ChartType = 'doughnut';
  public incomeDonutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public incomeDonutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: { color: '#64748b', font: { size: 11 }, padding: 10, boxWidth: 12 }
      }
    }
  };

  public expenseDonutType: ChartType = 'doughnut';
  public expenseDonutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public expenseDonutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: { color: '#64748b', font: { size: 11 }, padding: 10, boxWidth: 12 }
      }
    }
  };

  private categoryTotals: CategoryBreakdown[] = [];
  private expenseTotals: CategoryBreakdown[] = [];

  constructor(
    private commonUtil: CommonUtil,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.user = this.commonUtil.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.categoryTotals = data.incomeByCategory;
        this.expenseTotals = data.expensesByCategory;
        this.buildBarChart(data.profitTrend);
        this.buildLineChart(data.profitTrend);
        this.buildIncomeDonutChart(data.incomeByCategory);
        this.buildExpenseDonutChart(data.expensesByCategory);
        this.loading = false;
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.loading = false;
      }
    });
  }

  private buildBarChart(trend: ProfitTrend[]): void {
    this.profitChartData = {
      labels: trend.map(t => t.month),
      datasets: [
        {
          label: 'Income',
          data: trend.map(t => t.income),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 18
        },
        {
          label: 'Expenses',
          data: trend.map(t => t.expense),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: '#ef4444',
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 18
        }
      ]
    };
  }

  private buildLineChart(trend: ProfitTrend[]): void {
    this.lineChartData = {
      labels: trend.map(t => t.month),
      datasets: [
        {
          label: 'Net Profit',
          data: trend.map(t => t.profit),
          borderColor: '#8c0b4e',
          backgroundColor: 'rgba(140, 11, 78, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#8c0b4e',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }

  private buildIncomeDonutChart(categories: CategoryBreakdown[]): void {
    const colors = this.generateColors(categories.length);
    this.incomeDonutData = {
      labels: categories.map(c => c.categoryName),
      datasets: [{
        data: categories.map(c => c.totalAmount),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }

  private buildExpenseDonutChart(categories: CategoryBreakdown[]): void {
    const colors = this.generateColors(categories.length);
    this.expenseDonutData = {
      labels: categories.map(c => c.categoryName),
      datasets: [{
        data: categories.map(c => c.totalAmount),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }

  private generateColors(count: number): string[] {
    const palette = [
      '#8c0b4e', '#10b981', '#3b82f6', '#f59e0b',
      '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899',
      '#84cc16', '#f97316', '#6366f1', '#14b8a6'
    ];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }

  getPercentage(index: number): string {
    const cat = this.categoryTotals[index];
    if (!cat) return '0';
    return String(cat.percentage ?? 0);
  }

  getExpensePercentage(index: number): string {
    const cat = this.expenseTotals[index];
    if (!cat) return '0';
    return String(cat.percentage ?? 0);
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '$0.00';
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatAmount(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '$0';
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

  getNetProfitDisplay(): string {
    if (!this.dashboardData) return '$0.00';
    return this.formatCurrency(this.dashboardData.netProfit);
  }

  getNetProfitIcon(): string {
    if (!this.dashboardData) return 'fa-minus';
    return this.dashboardData.netProfit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  }

  getNetProfitClass(): string {
    if (!this.dashboardData) return '';
    return this.dashboardData.netProfit >= 0 ? 'trend-up' : 'trend-down';
  }

  getStatusClass(status: string): string {
    switch (status ? status.toLowerCase() : '') {
      case 'paid': return 'approved';
      case 'partial': return 'pending';
      case 'unpaid': return 'rejected';
      default: return 'pending';
    }
  }

  getCategoryIcon(categoryName: string): string {
    const name = categoryName ? categoryName.toLowerCase() : '';
    if (name.includes('hotel') || name.includes('accommodation')) return 'fa-hotel';
    if (name.includes('flight') || name.includes('travel') || name.includes('transport')) return 'fa-plane';
    if (name.includes('food') || name.includes('meal') || name.includes('dining')) return 'fa-utensils';
    if (name.includes('taxi') || name.includes('car')) return 'fa-taxi';
    if (name.includes('shop') || name.includes('retail')) return 'fa-shopping-bag';
    if (name.includes('income') || name.includes('revenue') || name.includes('sale')) return 'fa-dollar-sign';
    if (name.includes('utilities')) return 'fa-bolt';
    if (name.includes('insurance')) return 'fa-shield-alt';
    return 'fa-tag';
  }

  getCategoryIconClass(categoryName: string): string {
    const name = categoryName ? categoryName.toLowerCase() : '';
    if (name.includes('hotel') || name.includes('accommodation')) return 'hotel-icon';
    if (name.includes('flight') || name.includes('travel') || name.includes('transport')) return 'flight-icon';
    if (name.includes('food') || name.includes('meal') || name.includes('dining')) return 'food-icon';
    if (name.includes('taxi') || name.includes('car')) return 'transport-icon';
    if (name.includes('income') || name.includes('revenue') || name.includes('sale')) return 'success-icon';
    return 'flight-icon';
  }

  getTransactionIconClass(type: string): string {
    return (type ? type.toLowerCase() : '') === 'income' ? 'success-icon' : 'flight-icon';
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

  getIncomeChange(): number {
    return this.dashboardData?.incomeChangePercent ?? 0;
  }

  getExpenseChange(): number {
    return this.dashboardData?.expenseChangePercent ?? 0;
  }

  getTotalIncome(): number {
    return this.dashboardData?.totalIncome ?? 0;
  }

  getTotalExpenses(): number {
    return this.dashboardData?.totalExpenses ?? 0;
  }

  getNetProfit(): number {
    return this.dashboardData?.netProfit ?? 0;
  }

  getTotalCustomers(): number {
    return this.dashboardData?.totalCustomers ?? 0;
  }

  getPendingApprovals(): number {
    return this.dashboardData?.pendingApprovals ?? 0;
  }

  getTotalIncomeLastPeriod(): number {
    return this.dashboardData?.totalIncomeLastPeriod ?? 0;
  }

  getTotalExpensesLastPeriod(): number {
    return this.dashboardData?.totalExpensesLastPeriod ?? 0;
  }

  hasPendingApprovals(): boolean {
    return !!(this.dashboardData?.pendingApprovals && this.dashboardData.pendingApprovals > 0);
  }

  showIncomeChange(): boolean {
    const change = this.dashboardData?.incomeChangePercent ?? 0;
    return change !== 0;
  }

  showExpenseChange(): boolean {
    const change = this.dashboardData?.expenseChangePercent ?? 0;
    return change !== 0;
  }

  isProfitable(): boolean {
    return !!(this.dashboardData && this.dashboardData.netProfit >= 0);
  }

  getIncomeCategories(): CategoryBreakdown[] {
    return this.dashboardData?.incomeByCategory ?? [];
  }

  getExpenseCategories(): CategoryBreakdown[] {
    return this.dashboardData?.expensesByCategory ?? [];
  }

  hasIncomeCategories(): boolean {
    const cats = this.dashboardData?.incomeByCategory ?? [];
    return cats.length > 0;
  }

  hasExpenseCategories(): boolean {
    const cats = this.dashboardData?.expensesByCategory ?? [];
    return cats.length > 0;
  }

  getIncomeCategorySlice(): CategoryBreakdown[] {
    return this.getIncomeCategories().slice(0, 4);
  }

  getExpenseCategorySlice(): CategoryBreakdown[] {
    return this.getExpenseCategories().slice(0, 4);
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
