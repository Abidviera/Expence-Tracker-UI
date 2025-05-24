import { Component } from '@angular/core';
import { CommonUtil } from '../../../shared/utilities/CommonUtil';
import { ActivatedRoute, Router } from '@angular/router';
import { IncomeService } from '../../../services/income.service';
import { IncomeDto } from '../../../models/Income.model';
import { ToasterService } from '../../../services/toaster.service';
import { Customer } from '../../../models/Customer.model';
import { Destinations } from '../../../models/Destinations.model';
import { Categories } from '../../../models/ExpenseCategories.model';
import { CustomerService } from '../../../services/customer.service';
import { DestinationsService } from '../../../services/destinations.service';
import { CategoryService } from '../../../services/category.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-income-creation',
  standalone: false,
  templateUrl: './income-creation.component.html',
  styleUrl: './income-creation.component.scss',
})
export class IncomeCreationComponent {
  isLoading = false;
  isEditMode = false;
  customers: Customer[] = [];
  destinations: Destinations[] = [];
  Categories: Categories[] = [];

  selectedCategory: Categories | null = null;
  selectedCustomer: Customer | null = null;
  selectedTrip: Destinations | null = null;

  income: IncomeDto = this.getDefaultIncome();

  constructor(
    private incomeService: IncomeService,
    private commonUtil: CommonUtil,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToasterService,
    private customerService: CustomerService,
    private destinationService: DestinationsService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    const incomeId = this.route.snapshot.paramMap.get('id');
    forkJoin({
      customers: this.customerService.getCustomers(),
      destinations: this.destinationService.getAllDestinations(),
      categories: this.categoryService.getAllCategories(),
    }).subscribe({
      next: ({ customers, destinations, categories }) => {
        this.customers = customers;
        this.destinations = destinations;
        this.Categories = categories;

        if (incomeId) {
          this.isEditMode = true;
          this.loadIncomeForEdit(incomeId);
        } else {
          this.income.addedBy = this.commonUtil.getCurrentUser()?.userId ?? '';
        }
      },
      error: (err) => {
        console.error('Error loading initial data', err);
        this.toastService.error('Error loading initial data');
      },
    });
  }

  private getDefaultIncome(): IncomeDto {
    return {
      incomeId: undefined,
      source: '',
      amount: 0,
      paid: 0,
      tax: 0,
      date: new Date(),
      description: '',
      location: '',
      addedBy: '',
      categoryId: '',
      customerId: '',
      tripId: '',
    };
  }

  updateBalance(): void {
    // Ensure paid amount doesn't exceed the total amount
    if (this.income.paid > this.income.amount) {
      this.income.paid = this.income.amount;
      this.toastService.warning('Paid amount cannot exceed the total amount');
    }
  }

  loadIncomeForEdit(incomeId: string): void {
    this.incomeService.getIncomeById(incomeId).subscribe({
      next: (income) => {
        this.income = {
          ...income,
           paid: income.paid || 0,
          date: new Date(income.date),
        };
        console.log(income);
        this.setSelectedObjects(income);
      },
      error: () => {
        this.toastService.error('Error loading income for edit');
        this.router.navigate(['/incomes']);
      },
    });
  }

  private setSelectedObjects(income: IncomeDto): void {
    this.selectedCategory =
      this.Categories.find((c) => c.id === income.categoryId) || null;
    this.selectedCustomer =
      this.customers.find((c) => c.customerId === income.customerId) || null;
    this.selectedTrip =
      this.destinations.find((d) => d.id === income.tripId) || null;
  }
  private validateIncome(): boolean {
  if (this.income.paid > this.income.amount) {
    this.toastService.error('Paid amount cannot exceed the total amount');
    return false;
  }
  return true;
}

  submitIncome(): void {
    if (!this.validateIncome()) {
    return;
  }
    this.income.tax = 0;
    if (this.isEditMode && this.income.incomeId) {
      this.updateIncome();
    } else {
      this.createIncome();
    }
  }

  private updateIncome(): void {
    this.incomeService
      .updateIncome(this.income.incomeId!, this.income)
      .subscribe({
        next: () => {
           this.handleSuccess(
          'Income updated successfully',
          '/features/incomesList'
        ),
          this.resetForm();
        },
        error: (err) => {
          this.toastService.error('Error updating income:', err);
        },
      });
  }

    private handleSuccess(message: string, navigateTo?: string): void {
    this.toastService.success(message);
    if (navigateTo) {
      this.router.navigate([navigateTo]);
    } else {
      this.resetForm();
    }
  }

  private createIncome(): void {
    this.incomeService.createIncome(this.income).subscribe({
      next: (createdIncome) => {
        this.router.navigate(['/incomes', createdIncome.incomeId]);
        this.toastService.success('Income Created Successfully');
        this.resetForm();
      },
      error: () => {
        this.toastService.error('Error creating income');
      },
    });
  }

  resetForm(): void {
    this.income = {
      source: '',
      amount: 0,
      tax: 0,
      paid: 0,
      date: new Date(),
      addedBy: this.commonUtil.getCurrentUser()?.userId ?? '',
      categoryId: '',
      location: '',
      customerId: '',
      tripId: '',
    };
    this.selectedCategory = null;
    this.selectedCustomer = null;
    this.selectedTrip = null;
  }

  onCustomerSelect(customer: Customer): void {
    this.income.customerId = customer?.customerId;
    this.selectedCustomer = customer || null;
  }
  onTripSelect(destination: Destinations): void {
    this.income.tripId = destination?.id;
    this.selectedTrip = destination || null;
  }
  onCategorySelect(category: Categories): void {
    this.income.categoryId = category?.id;
    this.selectedCategory = category || null;
  }
}
