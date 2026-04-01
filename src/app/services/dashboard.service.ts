import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FilterKey, DateFilterParams } from './date-filter.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}api/Dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch dashboard data with optional date filter.
   * If no filter is provided, defaults to 'thisMonth'.
   */
  getDashboardData(filter?: DateFilterParams): Observable<DashboardData> {
    let params = new HttpParams();

    if (filter) {
      params = params.set('filterKey', filter.filterKey);
      params = params.set('fromDate', filter.fromDate);
      params = params.set('toDate', filter.toDate);
    }

    return this.http.get<DashboardData>(this.apiUrl, { params });
  }
}

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalIncomeLastPeriod: number;
  totalExpensesLastPeriod: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  totalCustomers: number;
  totalTrips: number;
  pendingApprovals: number;
  monthlyIncome: MonthlyData[];
  monthlyExpenses: MonthlyData[];
  incomeByCategory: CategoryBreakdown[];
  expensesByCategory: CategoryBreakdown[];
  recentTransactions: RecentTransaction[];
  profitTrend: ProfitTrend[];
}

export interface MonthlyData {
  month: string;
  shortMonth: string;
  year: number;
  monthNumber: number;
  amount: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface RecentTransaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  categoryName: string;
  transactionType: string;
  customerName: string | null;
  location: string | null;
  paid: number;
  balance: number;
  status: string;
}

export interface ProfitTrend {
  month: string;
  year: number;
  income: number;
  expense: number;
  profit: number;
}
