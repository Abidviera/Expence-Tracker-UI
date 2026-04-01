import { Component } from '@angular/core';
import {
  Expense,
  ExpenseCreate,
  ExpenseUpdateDto,
} from '../../../models/Expense.model';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/Customer.model';
import { CountryService } from '../../../services/country.service';
import { ExpenseService } from '../../../services/expense.service';
import { Categories } from '../../../models/ExpenseCategories.model';
import { CommonUtil } from '../../../shared/utilities/CommonUtil';
import { ToasterService } from '../../../services/toaster.service';
import { CategoryService } from '../../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CurrencyService } from '../../../services/currency.service';
import { CurrencyFormatService } from '../../../services/currency-format.service';

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
  countries: any[] = [];
  locations: any[] = [];

  isEditMode = false;
  isLoading = false;
  activeCurrencySymbol = '';

  expenseId: string | null = null;
  userId: string = '';

  selectedCountry: any = null;
  selectedLocation: any = null;

  constructor(
    private customerService: CustomerService,
    private countryService: CountryService,
    private expenseService: ExpenseService,
    private toasterService: ToasterService,
    private commonUtil: CommonUtil,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private currencyService: CurrencyService,
    private currencyFormatService: CurrencyFormatService,
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.loadActiveCurrency();
  }

  private loadActiveCurrency(): void {
    this.currencyService.getActiveCurrencies().subscribe({
      next: (currencies) => {
        if (currencies && currencies.length > 0) {
          const active = currencies[0];
          this.currencyFormatService.setActiveCurrency(active);
          this.activeCurrencySymbol = active.imageUrl
            ? `<img src="${active.imageUrl}" class="currency-icon-img" alt="${active.code}" />`
            : active.symbol;
          if (this.expense.currency === 'USD' || !this.expense.currency) {
            this.expense.currency = active.code;
          }
        }
      },
      error: () => {},
    });
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
        this.countryService.getActiveCountries(),
        this.categoryService.getAllCategories(),
      ]).toPromise();

      if (data) {
        this.customers = data[0].data;
        this.countries = data[1];
        this.categories = data[2];
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
    // Extract IDs from nested objects (API response uses nested objects with countryId, locationId, etc.)
    const countryId = expense.country?.countryId || expense.countryId || '';
    const locationId = expense.location?.locationId || expense.locationId || '';
    const categoryId = expense.category?.id || expense.categoryId || '';
    const customerId = expense.customer?.customerId || expense.customerId || '';

    // Extract location text from nested object
    const locationText = typeof expense.location === 'string'
      ? expense.location
      : expense.location?.locationName || expense.location?.city || '';

    this.expense = {
      title: expense.title || '',
      categoryId,
      customerId,
      countryId,
      locationId,
      amount: expense.amount || 0,
      paid: expense.paid || 0,
      currency: expense.currency || 'USD',
      date: expense.date ? new Date(expense.date) : new Date(),
      location: locationText,
      description: expense.description || '',
      tax: expense.tax || undefined,
      createdByUserId: this.userId,
    };

    // Pre-select country dropdown
    if (countryId) {
      this.selectedCountry = this.countries.find(
        (c) => c.countryId === countryId
      ) || null;
    }

    // Pre-select location dropdown
    if (locationId) {
      this.countryService.getLocationsByCountry(countryId).subscribe({
        next: (locations) => {
          this.locations = locations;
          this.selectedLocation =
            this.locations.find((l) => l.locationId === locationId) || null;
        },
        error: () => {
          console.error('Error loading locations for edit');
        },
      });
    }
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

  onCountrySelect(country: any): void {
    this.selectedCountry = country || null;
    this.selectedLocation = null;
    this.locations = [];
    this.expense.countryId = country?.countryId;
    this.expense.locationId = '';
    if (country?.countryId) {
      this.countryService.getLocationsByCountry(country.countryId).subscribe({
        next: (locations) => {
          this.locations = locations;
        },
        error: (err) => {
          console.error('Error loading locations', err);
        },
      });
    }
  }

  onLocationSelect(location: any): void {
    this.selectedLocation = location || null;
    this.expense.locationId = location?.locationId;
  }

  onCategorySelect(category: Categories): void {
    this.expense.categoryId = category?.id;
  }

  resetForm(): void {
    this.expense = this.getEmptyExpense();
    this.selectedCountry = null;
    this.selectedLocation = null;
    this.locations = [];
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
      countryId: this.expense.countryId,
      locationId: this.expense.locationId,
      amount: Number(this.expense.amount),
      paid: Number(this.expense.paid),
      currency: this.expense.currency,
      date: this.expense.date,
      location: typeof this.expense.location === 'string' ? this.expense.location : String(this.expense.location || ''),
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
    if (this.expense.paid > this.expense.amount) {
      this.expense.paid = this.expense.amount;
      this.toasterService.warning('Paid amount cannot exceed the total amount');
    }
  }
}
