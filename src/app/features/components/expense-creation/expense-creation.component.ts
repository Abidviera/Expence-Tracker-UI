import { Component } from '@angular/core';
import { Expense, ExpenseCreate, ExpenseUpdateDto } from '../../../models/Expense.model';
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
  selectedCustomerId: string | number | null = null;
  expense: ExpenseCreate = this.getEmptyExpense();
  isEditMode = false;
  expenseId: string | null = null;
  categories: Categories[] = [];
  userId = '';
  customers: Customer[] = [];
  destinations: Destinations[] = [];

  isLoading = false;

  constructor(
    private customerService: CustomerService,
    private destinationService: DestinationsService,
    private expenseService: ExpenseService,
    private toasterService: ToasterService,
    private commonUtil: CommonUtil,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
     const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { expense: Expense };
    
    if (state?.expense) {
      this.isEditMode = true;
      this.expenseId = state.expense.expenseId;
      this.patchFormValues(state.expense);
    } else {
      this.resetForm();
    }
  }
    ngOnInit(): void {
    this.userId = this.commonUtil.getCurrentUser()?.userId ?? '';
    console.log(this.userId);

   this.loadInitialData(() => {
    this.route.paramMap.subscribe(params => {
      const expense = history.state.expense;
      if (expense) {
        this.isEditMode = true;
        this.expenseId = expense.expenseId;
        this.patchFormValues(expense);
      } else {
        this.resetForm();
      }
    });
  });
  }

private patchFormValues(expense: any): void {
  setTimeout(() => {
    this.expense = {
      title: expense.title || '',
      categoryId: expense.category?.id || expense.categoryId || '',
      customerId: expense.customer?.customerId || expense.customerId || '',
      tripId: expense.tripId || '',
      amount: expense.amount || 0,
      currency: expense.currency || 'USD',
      date: expense.date ? new Date(expense.date) : new Date(),
      location: expense.location || '',
      description: expense.description || '',
      tax: expense.tax || undefined,
      createdByUserId: this.userId
    };
    
    console.log('Patched expense values:', this.expense);
  }, 100);
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
  onCategorySelect(category: Categories): void {
    this.expense.categoryId = category?.id;
  }

  loadInitialData(callback?: () => void): void {
  this.isLoading = true;
  
  forkJoin([
    this.customerService.getCustomers(),
    this.destinationService.getAllDestinations(),
    this.categoryService.getAllCategories()
  ]).subscribe({
    next: ([customers, destinations, categories]) => {
      this.customers = customers;
      console.log(this.customers)
      this.destinations = destinations;
      console.log(this.destinations)
      this.categories = categories;
      console.log(this.categories)
      
      if (callback) {
        callback();
      }
    },
    error: (err) => {
      console.error('Error loading initial data', err);
      this.isLoading = false;
    },
    complete: () => {
      this.isLoading = false;
    }
  });
}

  resetForm(): void {
    this.expense = this.getEmptyExpense();
  }

  submitExpense(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    const payload: ExpenseCreate | ExpenseUpdateDto = {
      title: this.expense.title,
      categoryId: this.expense.categoryId,
      customerId: this.expense.customerId,
      tripId: this.expense.tripId,
      amount: Number(this.expense.amount),
      currency: this.expense.currency,
      date: this.expense.date,
      location: this.expense.location,
      description: this.expense.description,
      tax: this.expense.tax ? Number(this.expense.tax) : undefined
    };

    if (this.isEditMode && this.expenseId) {
      this.updateExpense(payload as ExpenseUpdateDto);
    } else {
      this.createExpense(payload as ExpenseCreate);
    }
  }

    private createExpense(payload: ExpenseCreate): void {
    payload.createdByUserId = this.userId;
    this.expenseService.createExpense(payload).subscribe({
      next: (res) => {
        this.toasterService.success('Expense created successfully');
        this.resetForm();
      },
      error: (err) => {
        this.toasterService.error('Error creating expense');
        console.error(err);
      },
      complete: () => (this.isLoading = false),
    });
  }

  private updateExpense(payload: ExpenseUpdateDto): void {
    if (!this.expenseId) return;
    
    this.expenseService.updateExpense(this.expenseId, payload).subscribe({
      next: (res) => {
        this.toasterService.success('Expense updated successfully');
        this.router.navigate(['/features/ExpensesList']);
      },
      error: (err) => {
        this.toasterService.error('Error updating expense');
        console.error(err);
      },
      complete: () => (this.isLoading = false),
    });
  }
}
