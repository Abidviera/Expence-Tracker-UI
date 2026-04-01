import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DateFilterParams } from './date-filter.service';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly apiUrl = `${environment.apiUrl}api/Analytics`;

  constructor(private http: HttpClient) {}

  getAnalyticsData(filter?: DateFilterParams): Observable<AnalyticsResponse> {
    const searchParams = new URLSearchParams();
    if (filter) {
      searchParams.set('filterKey', filter.filterKey);
      if (filter.fromDate) searchParams.set('fromDate', filter.fromDate);
      if (filter.toDate) searchParams.set('toDate', filter.toDate);
    }
    return this.http.get<AnalyticsResponse>(`${this.apiUrl}?${searchParams.toString()}`);
  }
}

// ─── Master Response ───
export interface AnalyticsResponse {
  countryOverview: CountryOverview;
  locationOverview: LocationOverview;
  categoryProfitability: CategoryProfitability;
  customerLifetimeValue: CustomerLifetimeValue;
  topCustomers: TopCustomers;
  topExpenses: TopExpenses;
  recurringVsOneTime: RecurringVsOneTime;
  growthRate: GrowthRate;
  anomalyDetection: AnomalyDetection;
  paymentStatusOverview: PaymentStatusOverview;
  expenseHeatmap: ExpenseHeatmap;
  budgetVsActual: BudgetVsActual;
  topIncomeSources: TopIncomeSources;
  quickInsights: QuickInsights;
}

// ─── 1. Country Overview ───
export interface CountryOverview {
  totalCountries: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  countries: CountryMetric[];
  hasData: boolean;
}

export interface CountryMetric {
  countryId: string;
  countryName: string;
  countryCode: string;
  region: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  profitMargin: number;
  topLocation: string;
  customerCount: number;
}

// ─── 2. Location Overview ───
export interface LocationOverview {
  totalLocations: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  locations: LocationMetric[];
  hasData: boolean;
}

export interface LocationMetric {
  locationId: string;
  locationName: string;
  countryName: string;
  city: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  profitMargin: number;
  customerCount: number;
}

// ─── 3. Category Profitability ───
export interface CategoryProfitability {
  categories: CategoryProfitMetric[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  hasData: boolean;
}

export interface CategoryProfitMetric {
  categoryId: string;
  categoryName: string;
  incomeAmount: number;
  expenseAmount: number;
  netProfit: number;
  incomeCount: number;
  expenseCount: number;
  profitMargin: number;
  performanceLabel: string;
}

// ─── 4. Customer Lifetime Value ───
export interface CustomerLifetimeValue {
  totalCustomers: number;
  averageClv: number;
  highestClv: number;
  lowestClv: number;
  medianClv: number;
  customers: CustomerClv[];
  hasData: boolean;
}

export interface CustomerClv {
  customerId: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  totalIncome: number;
  totalExpenses: number;
  netContribution: number;
  transactionCount: number;
  firstTransaction: string;
  lastTransaction: string;
  lifetimeDays: number;
  averageTransactionValue: number;
  countryName: string;
  locationName: string;
  clvTier: string;
}

// ─── 5. Top Customers ───
export interface TopCustomers {
  byRevenue: TopCustomer[];
  byProfitContribution: TopCustomer[];
  byTransactionCount: TopCustomer[];
  hasData: boolean;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  email: string;
  value: number;
  rank: number;
  countryName: string;
  percentageOfTotal: number;
}

// ─── 6. Top Expenses ───
export interface TopExpenses {
  byAmount: TopExpense[];
  byFrequency: TopExpense[];
  totalExpenses: number;
  hasData: boolean;
}

export interface TopExpense {
  expenseId: string;
  title: string;
  categoryName: string;
  categoryId: string;
  amount: number;
  date: string;
  customerName: string;
  countryName: string;
  locationName: string;
  status: string;
  rank: number;
  percentageOfTotal: number;
  isAnomaly: boolean;
}

// ─── 7. Recurring vs One-time ───
export interface RecurringVsOneTime {
  totalTransactions: number;
  recurringCount: number;
  oneTimeCount: number;
  recurringIncome: number;
  oneTimeIncome: number;
  recurringExpenses: number;
  oneTimeExpenses: number;
  recurringPercentage: number;
  oneTimePercentage: number;
  monthlyTrend: MonthlyRecurringTrend[];
  hasData: boolean;
}

export interface MonthlyRecurringTrend {
  month: string;
  year: number;
  recurringCount: number;
  oneTimeCount: number;
  recurringAmount: number;
  oneTimeAmount: number;
}

// ─── 8. Growth Rate ───
export interface GrowthRate {
  monthlyIncomeGrowth: number;
  monthlyExpenseGrowth: number;
  monthlyProfitGrowth: number;
  yearlyIncomeGrowth: number;
  yearlyExpenseGrowth: number;
  yearlyProfitGrowth: number;
  quarterlyIncomeGrowth: number;
  quarterlyExpenseGrowth: number;
  monthlyGrowth: MonthlyGrowth[];
  averageMonthlyGrowth: number;
  projectedYearlyIncome: number;
  growthTrend: string;
}

export interface MonthlyGrowth {
  month: string;
  year: number;
  currentIncome: number;
  previousIncome: number;
  incomeGrowthPercent: number;
  currentExpenses: number;
  previousExpenses: number;
  expenseGrowthPercent: number;
  currentProfit: number;
  previousProfit: number;
  profitGrowthPercent: number;
}

// ─── 9. Anomaly Detection ───
export interface AnomalyDetection {
  totalExpensesAnalyzed: number;
  anomaliesDetected: number;
  meanExpense: number;
  standardDeviation: number;
  zScoreThreshold: number;
  anomalies: Anomaly[];
  hasData: boolean;
}

export interface Anomaly {
  expenseId: string;
  title: string;
  amount: number;
  date: string;
  categoryName: string;
  zScore: number;
  standardDeviationsFromMean: number;
  severity: string;
  reason: string;
  categoryAverage: number;
  percentageAboveAverage: number;
}

// ─── 10. Payment Status Overview ───
export interface PaymentStatusOverview {
  incomeStatus: PaymentSummary;
  expenseStatus: PaymentSummary;
  totalOutstanding: number;
  collectionRate: number;
  hasData: boolean;
}

export interface PaymentSummary {
  totalCount: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  totalAmount: number;
  paidAmount: number;
  partialAmount: number;
  unpaidAmount: number;
  paymentRate: number;
}

// ─── 11. Expense Heatmap ───
export interface ExpenseHeatmap {
  byDayOfWeek: DayOfWeekMetric[];
  byHour: HourlyMetric[];
  byDayOfMonth: MonthlyDayMetric[];
  peakExpenseDay: string;
  peakExpenseDayAmount: number;
  peakExpenseHour: string;
  peakExpenseHourAmount: number;
  hasData: boolean;
}

export interface DayOfWeekMetric {
  dayIndex: number;
  dayName: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  percentageOfTotal: number;
}

export interface HourlyMetric {
  hour: number;
  hourLabel: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  percentageOfTotal: number;
}

export interface MonthlyDayMetric {
  dayOfMonth: number;
  totalAmount: number;
  transactionCount: number;
}

// ─── 12. Budget vs Actual ───
export interface BudgetVsActual {
  totalBudgeted: number;
  totalActual: number;
  totalVariance: number;
  variancePercent: number;
  categories: CategoryBudget[];
  hasData: boolean;
}

export interface CategoryBudget {
  categoryId: string;
  categoryName: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  status: string;
  transactionCount: number;
}

// ─── 13. Top Income Sources ───
export interface TopIncomeSources {
  totalIncome: number;
  sources: TopIncomeSource[];
  hasData: boolean;
}

export interface TopIncomeSource {
  incomeId: string;
  source: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  date: string;
  customerName: string;
  countryName: string;
  status: string;
  rank: number;
  percentageOfTotal: number;
}

// ─── 14. Quick Insights ───
export interface QuickInsights {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  warnings: string[];
  bestPerformingCountry: InsightMetric;
  worstPerformingCountry: InsightMetric;
  bestPerformingCategory: InsightMetric;
  highestClvCustomer: InsightMetric;
  expenseToIncomeRatio: number;
  activeCustomersThisPeriod: number;
  averageTransactionSize: number;
}

export interface InsightMetric {
  name: string;
  value: number;
  subtext: string;
}
