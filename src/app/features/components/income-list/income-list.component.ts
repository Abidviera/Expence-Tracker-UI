import { Component } from '@angular/core';
import { Income } from '../../../models/Income.model';
import { IncomeService } from '../../../services/income.service';
import { Subscription } from 'rxjs';
import { CommonUtil } from '../../../shared/utilities/CommonUtil';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseCreate } from '../../../models/Expense.model';
import { Customer } from '../../../models/Customer.model';
import { Destinations } from '../../../models/Destinations.model';
import { ExpenseCategories } from '../../../models/ExpenseCategories.model';
import { ExpenseCategory } from '../../../enums/ExpenseCategory.enum';
import { CustomerService } from '../../../services/customer.service';
import { DestinationsService } from '../../../services/destinations.service';
import { ExpenseService } from '../../../services/expense.service';
import { ExpensePaginationRequest } from '../../../models/ExpensePaginationRequest.model';
import { IncomePaginationRequest } from '../../../models/IncomePaginationRequest.model';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-income-list',
  standalone: false,
  templateUrl: './income-list.component.html',
  styleUrl: './income-list.component.scss',
})
export class IncomeListComponent {
  filterSection = false;
  isLoading = false;
  users: User[] = [];
  incomes: Income[] = [];
  totalRecords = 0;
  selectedUser: User | null = null;
  filters: IncomePaginationRequest = {
    pageNumber: 1,
    pageSize: 7,
    searchTerm: '',
    sortColumn: '',
    sortDirection: 'asc',
    fromDate: '',
    toDate: '',
    minAmount: undefined,
    maxAmount: undefined,
    userId: undefined,
  };

  constructor(
    private incomeService: IncomeService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadIncomes();
    this.loadAllUsers();
  }

  toggleFilters() {
    this.filterSection = !this.filterSection;
  }

  loadIncomes() {
    this.isLoading = true;
    this.incomeService.getPagedIncomes(this.filters).subscribe({
      next: (response) => {
        this.incomes = response.data;
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
        console.log(this.incomes);
      },
      error: (error) => {
        console.error('Error fetching incomes:', error);
        this.isLoading = false;
      },
    });
  }

  onSearchChange(searchTerm: string) {
    this.filters.searchTerm = searchTerm;
    this.filters.pageNumber = 1;
    this.loadIncomes();
  }

  onDateFilter(fromDate: string, toDate: string) {
    this.filters.fromDate = fromDate;
    this.filters.toDate = toDate;
    this.filters.pageNumber = 1;
    this.loadIncomes();
  }

  onAmountFilter(minAmount: number | undefined, maxAmount: number | undefined) {
    this.filters.minAmount = minAmount;
    this.filters.maxAmount = maxAmount;
    this.filters.pageNumber = 1;
    this.loadIncomes();
  }

  onUserFilter(userId?: string) {
    this.filters.userId = userId || undefined;
    this.filters.pageNumber = 1;
    this.loadIncomes();
  }

  onSortChange(sortColumn: string, sortDirection: string) {
    this.filters.sortColumn = sortColumn;
    this.filters.sortDirection = sortDirection;
    this.filters.pageNumber = 1;
    this.loadIncomes();
  }

  nextPage() {
    if (this.filters.pageNumber) {
      this.filters.pageNumber++;
      this.loadIncomes();
    }
  }

  previousPage() {
    if (this.filters.pageNumber && this.filters.pageNumber > 1) {
      this.filters.pageNumber--;
      this.loadIncomes();
    }
  }

  resetFilters() {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: '',
      sortDirection: 'asc',
      fromDate: '',
      toDate: '',
      minAmount: undefined,
      maxAmount: undefined,
      userId: undefined,
    };
    this.loadIncomes();
  }

  getStartItem(): number {
    return (
      ((this.filters.pageNumber || 1) - 1) * (this.filters.pageSize || 10) + 1
    );
  }

  getEndItem(): number {
    const end = (this.filters.pageNumber || 1) * (this.filters.pageSize || 10);
    return end > this.totalRecords ? this.totalRecords : end;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / (this.filters.pageSize || 10));
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.filters.pageNumber || 1;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.filters.pageNumber = page;
      this.loadIncomes();
    }
  }

  deleteIncome(incomeId: string): void {
    if (confirm('Are you sure you want to delete this income?')) {
      this.incomeService.deleteIncome(incomeId).subscribe({
        next: () => {
          this.incomes = this.incomes.filter(
            (income) => income.incomeId !== incomeId
          );
          this.loadIncomes();
        },
        error: (err) => {
          console.error('Error deleting income:', err);
        },
      });
    }
  }

  editIncome(incomeId: string): void {
    this.router.navigate(['/features/incomes/edit', incomeId]);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.selectedUser ||
      this.filters.fromDate ||
      this.filters.toDate ||
      this.filters.minAmount !== undefined ||
      this.filters.maxAmount !== undefined
    );
  }

  clearDate(): void {
    this.filters.fromDate = '';
    this.filters.toDate = '';
    this.loadIncomes();
  }

  clearAmount(): void {
    this.filters.minAmount = undefined;
    this.filters.maxAmount = undefined;
    this.loadIncomes();
  }

  clearCustomer(): void {
    this.selectedUser = null;
    this.filters.userId = undefined;
    this.loadIncomes();
  }

  onUserSelect(selecteduser: User): void {
    this.selectedUser = selecteduser;
    console.log('selectedUser:', selecteduser);
    this.onUserFilter(this.selectedUser?.userId);
  }

  loadAllUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (user) => {
        this.users = user.map((u) => ({
          ...u,
          fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customers', err);
        this.isLoading = false;
      },
    });
  }

  getUserFullName(user: User): string {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
}
