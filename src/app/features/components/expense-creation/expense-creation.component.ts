import { Component } from '@angular/core';
import { Expense, ExpenseCreate } from '../../../models/Expense.model';
import { ExpenseCategory } from '../../../enums/ExpenseCategory.enum';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/Customer.model';
import { DestinationsService } from '../../../services/destinations.service';
import { Destinations } from '../../../models/Destinations.model';
import { ExpenseService } from '../../../services/expense.service';
import { ExpenseCategories } from '../../../models/ExpenseCategories.model';
import { CommonUtil } from '../../../shared/utilities/CommonUtil';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-expense-creation',
  standalone: false,
  templateUrl: './expense-creation.component.html',
  styleUrl: './expense-creation.component.scss',
})
export class ExpenseCreationComponent {
  selectedCustomerId: string | number | null = null;
  expense: ExpenseCreate = this.getEmptyExpense();

  categories: ExpenseCategory[] = [];
  userId = '';
  customers: Customer[] = [];
  destinations: Destinations[] = [];
  expenseCategories: ExpenseCategories[] = [];
  isLoading = false;

  constructor(
    private customerService: CustomerService,
    private destinationService: DestinationsService,
    private expenseService: ExpenseService,
    private toasterService: ToasterService,
    private commonUtil: CommonUtil
  ) {
    this.resetForm();
  }

  ngOnInit(): void {
    this.userId = this.commonUtil.getCurrentUser()?.userId ?? '';
    console.log(this.userId);
    this.resetForm();
    this.loadInitialData();
  }

  getEmptyExpense(): ExpenseCreate {
    return {
      title: '',
      categoryId: '',
      amount: 0,
      currency: 'USD',
      date: new Date(),
      createdByUserId: this.userId,
    };
  }

  onCustomerSelect(customer: Customer): void {
    this.expense.customerId = customer?.customerId;
  }
  onTripSelect(destination: Destinations): void {
    this.expense.tripId = destination?.id;
  }
  onCategorySelect(category: ExpenseCategories): void {
    this.expense.categoryId = category?.id;
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.customerService.getCustomers().subscribe({
      next: (data) => (this.customers = data),
      error: (err) => console.error('Error loading customers', err),
    });

    this.destinationService.getAllDestinations().subscribe({
      next: (data) => (this.destinations = data),
      error: (err) => console.error('Error loading destinations', err),
    });

    this.expenseService.getAllExpenseCategories().subscribe({
      next: (data) => (this.expenseCategories = data),
      error: (err) => console.error('Error loading categories', err),
      complete: () => (this.isLoading = false),
    });
  }

  resetForm(): void {
    this.expense = this.getEmptyExpense();
  }

  submitExpense(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    const payload: ExpenseCreate = {
      ...this.expense,
      amount: Number(this.expense.amount),
      tax: this.expense.tax ? Number(this.expense.tax) : undefined,
      createdByUserId: this.userId,
      date: new Date
    };

    this.expenseService.createExpense(payload).subscribe({
      next: (res) => {
        this.toasterService.success('Expense created Succesfull');
        this.resetForm();
      },
      error: (err) => {
        this.toasterService.error('Error creating expense');
      },
      complete: () => (this.isLoading = false),
    });
  }
}
