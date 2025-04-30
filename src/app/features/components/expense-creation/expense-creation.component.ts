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

@Component({
  selector: 'app-expense-creation',
  standalone: false,
  templateUrl: './expense-creation.component.html',
  styleUrl: './expense-creation.component.scss',
})
export class ExpenseCreationComponent {
  selectedCustomerId: string | number | null = null;
  newExpense: ExpenseCreate = {
    title: '',
    categoryId: '',
    amount: 0,
    currency: 'USD',
    date: new Date(),
    createdByUserId: '',
    tax: undefined,
    location: undefined,
    description: undefined,
    customerId: undefined,
    tripId: undefined,
  };

  categories: ExpenseCategory[] = [];
  user: any;
  customers: Customer[] = [];
  destinations: Destinations[] = [];
  expenseCategories: ExpenseCategories[] = [];
  isLoading = false;

  selectedCustomer: Customer | null = null;
  selectedDestination: Destinations | null = null;
  selectedCategory: ExpenseCategories | null = null;

  constructor(
    private customerService: CustomerService,
    private destinationService: DestinationsService,
    private expenseService: ExpenseService,
    private commonUtil: CommonUtil
  ) {
    this.resetForm();
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadDestinations();
    this.loadAllExpenceCategories();
    this.user = this.commonUtil.getCurrentUser();
    console.log(this.user.userId);
    this.resetForm();
  }

  onCustomerSelect(selectedCustomer: Customer): void {
    this.selectedCustomer = selectedCustomer;
    console.log('Selected customer:', selectedCustomer);
  }
  onTripSelect(selectedDestination: Destinations): void {
    this.selectedDestination = selectedDestination;
    console.log('Selected selectedDestination:', selectedDestination);
  }
  onCategorySelect(selectedCategory: ExpenseCategories): void {
    this.selectedCategory = selectedCategory;
    console.log('selectedCategory:', selectedCategory);
  }

  loadCustomers(): void {
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

  loadDestinations(): void {
    this.isLoading = true;
    this.destinationService.getAllDestinations().subscribe({
      next: (destination) => {
        this.destinations = destination;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customers', err);
        this.isLoading = false;
      },
    });
  }
  loadAllExpenceCategories(): void {
    this.isLoading = true;
    this.expenseService.getAllExpenseCategories().subscribe({
      next: (expenseCategories) => {
        this.expenseCategories = expenseCategories;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customers', err);
        this.isLoading = false;
      },
    });
  }

  private resetForm(): void {
    this.newExpense = {
      title: '',
      categoryId: '',
      amount: 0,
      currency: 'USD',
      date: new Date(),
      createdByUserId: this.user?.userId ?? '',
      tax: undefined,
      location: undefined,
      description: undefined,
      customerId: undefined,
      tripId: undefined,
    };
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;

    const expenseToCreate: ExpenseCreate = {
      ...this.newExpense,
      date: this.newExpense.date,
      amount: Number(this.newExpense.amount),
      tax: this.newExpense.tax ? Number(this.newExpense.tax) : undefined,
      categoryId: this.selectedCategory?.id,
      customerId: this.selectedCustomer?.customerId, 
      tripId: this.selectedDestination?.id,
      createdByUserId: this.user?.userId
    };

    this.expenseService.createExpense(expenseToCreate).subscribe({
      next: (response) => {
        console.log('Expense created:', response);
        this.resetForm();
      },
      error: (err) => {
        console.error('Error creating expense', err);
      },
      complete: () => (this.isLoading = false),
    });
  }
}
