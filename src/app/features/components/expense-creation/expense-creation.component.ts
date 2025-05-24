import { Component } from '@angular/core';
import {
  Expense,
  ExpenseCreate,
  ExpenseUpdateDto,
} from '../../../models/Expense.model';
import { ExpenseCategory } from '../../../enums/ExpenseCategory.enum';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/Customer.model';
import { DestinationsService } from '../../../services/destinations.service';
import { Destinations } from '../../../models/Destinations.model';
import { ExpenseService } from '../../../services/expense.service';
import { Categories } from '../../../models/ExpenseCategories.model';
import { CommonUtil } from '../../../shared/utilities/CommonUtil';
import { ToasterService } from '../../../services/toaster.service';
import { CategoryService } from '../../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-expense-creation',
  standalone: false,
  templateUrl: './expense-creation.component.html',
  styleUrl: './expense-creation.component.scss',
})
export class ExpenseCreationComponent {
  expense: ExpenseCreate = this.getEmptyExpense();
  categories: Categories[] = [];
  customers: Customer[] = [];
  destinations: Destinations[] = [];

  isEditMode = false;
  isLoading = false;

  expenseId: string | null = null;
  userId: string = '';

  constructor(
    private customerService: CustomerService,
    private destinationService: DestinationsService,
    private expenseService: ExpenseService,
    private toasterService: ToasterService,
    private commonUtil: CommonUtil,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
 
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.userId = this.commonUtil.getCurrentUser()?.userId ?? '';
    this.loadInitialData().then(() => this.checkForEditMode());
  }

  private async loadInitialData(): Promise<void> {
    this.isLoading = true;

    try {
      const data = await forkJoin([
        this.customerService.getCustomers(),
        this.destinationService.getAllDestinations(),
        this.categoryService.getAllCategories(),
      ]).toPromise();

      if (data) {
        [this.customers, this.destinations, this.categories] = data;
      }
    } catch (error) {
      console.error('Error loading initial data', error);
      this.toasterService.error('Failed to load required data');
    } finally {
      this.isLoading = false;
    }
  }

  private checkForEditMode(): void {
    const expense = history.state.expense;

    if (expense) {
      this.activateEditMode(expense);
    } else {
      this.resetForm();
    }
  }

  private activateEditMode(expense: any): void {
    this.isEditMode = true;
    this.expenseId = expense.expenseId;
    this.patchFormValues(expense);
  }

  private patchFormValues(expense: any): void {
    this.expense = {
      title: expense.title || '',
      categoryId: expense.category?.id || expense.categoryId || '',
      customerId: expense.customer?.customerId || expense.customerId || '',
      tripId: expense.tripId || '',
      amount: expense.amount || 0,
       paid: expense.paid || 0,
      currency: expense.currency || 'USD',
      date: expense.date ? new Date(expense.date) : new Date(),
      location: expense.location || '',
      description: expense.description || '',
      tax: expense.tax || undefined,
      createdByUserId: this.userId,
    };
  }

  private getEmptyExpense(): ExpenseCreate {
    return {
      title: '',
      categoryId: '',
      amount: 0,
     paid: 0,
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

  onCategorySelect(category: Categories): void {
    this.expense.categoryId = category?.id;
  }

  resetForm(): void {
    this.expense = this.getEmptyExpense();
  }

  submitExpense(): void {
    if (this.isLoading) return;
    
  if (this.expense.paid > this.expense.amount) {
    this.toasterService.error('Paid amount cannot exceed the total amount');
    return;
  }
    const payload = this.preparePayload();

    this.isEditMode && this.expenseId
      ? this.updateExpense(payload as ExpenseUpdateDto)
      : this.createExpense(payload as ExpenseCreate);
  }

  private preparePayload(): ExpenseCreate | ExpenseUpdateDto {
    return {
      title: this.expense.title,
      categoryId: this.expense.categoryId,
      customerId: this.expense.customerId,
      tripId: this.expense.tripId,
      amount: Number(this.expense.amount),
       paid: Number(this.expense.paid),
      currency: this.expense.currency,
      date: this.expense.date,
      location: this.expense.location,
      description: this.expense.description,
      tax: this.expense.tax ? Number(this.expense.tax) : undefined,
      ...(!this.isEditMode && { createdByUserId: this.userId }),
    };
  }

  private createExpense(payload: ExpenseCreate): void {
    this.isLoading = true;

    this.expenseService.createExpense(payload).subscribe({
      next: () => this.handleSuccess('Expense created successfully'),
      error: (err) => this.handleError('Error creating expense', err),
      complete: () => (this.isLoading = false),
    });
  }

  private updateExpense(payload: ExpenseUpdateDto): void {
    if (!this.expenseId) return;

    this.isLoading = true;

    this.expenseService.updateExpense(this.expenseId, payload).subscribe({
      next: () =>
        this.handleSuccess(
          'Expense updated successfully',
          '/features/ExpensesList'
        ),
      error: (err) => this.handleError('Error updating expense', err),
      complete: () => (this.isLoading = false),
    });
  }

  private handleSuccess(message: string, navigateTo?: string): void {
    this.toasterService.success(message);
    if (navigateTo) {
      this.router.navigate([navigateTo]);
    } else {
      this.resetForm();
    }
  }

  private handleError(message: string, error: any): void {
    this.toasterService.error(message);
    console.error(error);
  }


updateBalance(): void {
  // Ensure paid amount doesn't exceed the total amount
  if (this.expense.paid > this.expense.amount) {
    this.expense.paid = this.expense.amount;
    this.toasterService.warning('Paid amount cannot exceed the total amount');
  }
}

}
