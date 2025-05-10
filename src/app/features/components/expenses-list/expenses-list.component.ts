import { Component } from '@angular/core';
import { ExpensePaginationRequest } from '../../../models/ExpensePaginationRequest.model';
import { ExpenseService } from '../../../services/expense.service';
import { Categories } from '../../../models/ExpenseCategories.model';
import { Customer } from '../../../models/Customer.model';
import { Destinations } from '../../../models/Destinations.model';
import { CustomerService } from '../../../services/customer.service';
import { DestinationsService } from '../../../services/destinations.service';
import { CategoryService } from '../../../services/category.service';
import { Router } from '@angular/router';
import { Expense } from '../../../models/Expense.model';

@Component({
  selector: 'app-expenses-list',
  standalone: false,
  templateUrl: './expenses-list.component.html',
  styleUrl: './expenses-list.component.scss',
})
export class ExpensesListComponent {
  filterSection: boolean = false;
  isLoading = false;
  Categories: Categories[] = [];
  customers: Customer[] = [];
  destinations: Destinations[] = [];
  selectedCategory: Categories | null = null;
  selectedCustomer: Customer | null = null;
  selectedDestination: Destinations | null = null;
  expenses: any[] = [];
  totalRecords = 0;

  filters: ExpensePaginationRequest = {
    pageNumber: 1,
    pageSize: 7,
    searchTerm: '',
    sortColumn: '',
    sortDirection: 'asc',
    fromDate: '',
    toDate: '',
    minAmount: undefined,
    maxAmount: undefined,
    customerId: undefined,
    CategoryId: undefined,
    tripId: undefined,
  };

  constructor(
    private expenseService: ExpenseService,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private destinationService: DestinationsService,
        private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    Promise.all([
      this.loadExpenses(),
      this.loadAllExpenceCategories(),
      this.loadAllCustomers(),
      this.loadAllDestinations(),
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  toggleFilters() {
    this.filterSection = !this.filterSection;
  }

  loadExpenses() {
    this.expenseService.getPagedExpenses(this.filters).subscribe({
      next: (response) => {
        this.expenses = response.data;
        this.totalRecords = response.totalRecords;
        console.log(this.expenses);
      },
      error: (error) => {
        console.error('Error fetching expenses:', error);
      },
    });
  }

  onSearchChange(searchTerm: string) {
    this.filters.searchTerm = searchTerm;
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  onDateFilter(fromDate: string, toDate: string) {
    this.filters.fromDate = fromDate;
    this.filters.toDate = toDate;
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  onAmountFilter(minAmount: number | undefined, maxAmount: number | undefined) {
    this.filters.minAmount = minAmount;
    this.filters.maxAmount = maxAmount;
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  onTripFilter(tripId: string) {
    this.filters.tripId = tripId || undefined;
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  onCustomerFilter(customerId: string) {
    this.filters.customerId = customerId || undefined;

    if (this.selectedCustomer) {
      this.selectedCustomer.customerId = customerId;
    }
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  onDestinationFilter(DestinationID: string) {
    this.filters.tripId = DestinationID || undefined;

    if (this.selectedDestination) {
      this.selectedDestination.id = DestinationID;
    }
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  onCategoryFilter(CategoryId: string) {
    this.filters.CategoryId = CategoryId || undefined;

    if (this.selectedCategory) {
      this.selectedCategory.id = CategoryId;
    }
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  onSortChange(sortColumn: string, sortDirection: string) {
    this.filters.sortColumn = sortColumn;
    this.filters.sortDirection = sortDirection;
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  nextPage() {
    if (this.filters.pageNumber) {
      this.filters.pageNumber++;
      this.loadExpenses();
    }
  }

  previousPage() {
    if (this.filters.pageNumber && this.filters.pageNumber > 1) {
      this.filters.pageNumber--;
      this.loadExpenses();
    }
  }

  loadAllExpenceCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (category) => {
        this.Categories = category;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customers', err);
        this.isLoading = false;
      },
    });
  }
  loadAllCustomers(): void {
    this.isLoading = true;
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customers', err);
        this.isLoading = false;
      },
    });
  }
  loadAllDestinations(): void {
    this.isLoading = true;
    this.destinationService.getAllDestinations().subscribe({
      next: (destinations) => {
        this.destinations = destinations;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customers', err);
        this.isLoading = false;
      },
    });
  }

  onCategorySelect(selectedCategory: Categories): void {
    this.selectedCategory = selectedCategory;
    console.log('selectedCategory:', selectedCategory);
    this.onCategoryFilter(this.selectedCategory?.id);
  }
  onCustomerSelect(selectedCustomer: Customer): void {
    this.selectedCustomer = selectedCustomer;
    console.log('selectedCategory:', selectedCustomer);
    this.onCustomerFilter(this.selectedCustomer?.customerId);
  }
  onTripSelect(selectedTrip: Destinations): void {
    this.selectedDestination = selectedTrip;
    console.log('selectedCategory:', selectedTrip);
    this.onDestinationFilter(this.selectedDestination.id);
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
      customerId: undefined,
      CategoryId: undefined,
      tripId: undefined,
    };
    this.selectedCategory = null;
    this.selectedCustomer = null;
    this.selectedDestination = null;
    this.loadExpenses();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.selectedCategory ||
      this.selectedCustomer ||
      this.selectedDestination ||
      this.filters.fromDate ||
      this.filters.toDate ||
      this.filters.minAmount !== undefined ||
      this.filters.maxAmount !== undefined
    );
  }

  clearCategory(): void {
    this.selectedCategory = null;
    this.filters.CategoryId = undefined;
    this.loadExpenses();
  }

  clearCustomer(): void {
    this.selectedCustomer = null;
    this.filters.customerId = undefined;
    this.loadExpenses();
  }

  clearTrip(): void {
    this.selectedDestination = null;
    this.filters.tripId = undefined;
    this.loadExpenses();
  }

  clearDate(): void {
    this.filters.fromDate = '';
    this.filters.toDate = '';
    this.loadExpenses();
  }

  clearAmount(): void {
    this.filters.minAmount = undefined;
    this.filters.maxAmount = undefined;
    this.loadExpenses();
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
      this.loadExpenses();
    }
  }



// In your ExpenseListComponent
editExpense(expense: any) {
  console.log(expense)
  this.router.navigate(['/features/ExpenseCreation'], { 
    state: { expense: expense } 
  });
}
}
