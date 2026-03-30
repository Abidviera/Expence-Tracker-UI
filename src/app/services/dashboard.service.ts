import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}api/Dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
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
