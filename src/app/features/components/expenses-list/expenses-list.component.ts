import { Component } from '@angular/core';
import { ExpensePaginationRequest } from '../../../models/ExpensePaginationRequest.model';
import { ExpenseService } from '../../../services/expense.service';

@Component({
  selector: 'app-expenses-list',
  standalone: false,
  templateUrl: './expenses-list.component.html',
  styleUrl: './expenses-list.component.scss'
})
export class ExpensesListComponent {
filterSection : boolean = false


toggleFilters() {
  this.filterSection = !this.filterSection;
}


expenses: any[] = [];
totalRecords = 0;

filters: ExpensePaginationRequest = {
  pageNumber: 1,
  pageSize: 10,
  searchTerm: '',
  sortColumn: '',
  sortDirection: 'asc',
  fromDate: '',
  toDate: '',
  category: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  customerId: undefined,
  tripId: undefined
};

constructor(private expenseService: ExpenseService) {}

ngOnInit(){
  
  this.loadExpenses()
}
loadExpenses() {
  this.expenseService.getPagedExpenses(this.filters).subscribe({
    next: (response) => {
      this.expenses = response.data;
      this.totalRecords = response.totalRecords;
      console.log(this.expenses)
    },
    error: (error) => {
      console.error('Error fetching expenses:', error);
    }
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

  
}
