import { Component, OnInit } from '@angular/core';
import { ExpensePaginationRequest } from '../../../models/ExpensePaginationRequest.model';
import { ExpenseService } from '../../../services/expense.service';
import { Categories } from '../../../models/ExpenseCategories.model';
import { Customer } from '../../../models/Customer.model';
import { CustomerService } from '../../../services/customer.service';
import { CountryService } from '../../../services/country.service';
import { CategoryService } from '../../../services/category.service';
import { Router } from '@angular/router';
import { IncomeDetailsPopupComponent } from '../../../shared/modals/income-details-popup/income-details-popup.component';
import { ModalService } from '../../../services/modal.service';
import { ExportModalComponent } from '../../../shared/modals/export-modal/export-modal.component';
import { ToasterService } from '../../../services/toaster.service';
import { InvoiceTemplate3Component } from '../../../shared/Templates/invoice-template3/invoice-template3.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonUtil } from '../../../shared/utilities/CommonUtil';
import { UserRole } from '../../../enums/UserRole.enum';
import { DateFilterService, FilterKey } from '../../../services/date-filter.service';
import { CurrencyService } from '../../../services/currency.service';
import { CurrencyFormatService } from '../../../services/currency-format.service';

@Component({
  selector: 'app-expenses-list',
  standalone: false,
  templateUrl: './expenses-list.component.html',
  styleUrl: './expenses-list.component.scss',
})
export class ExpensesListComponent implements OnInit {
  filterSection: boolean = false;
  isLoading = false;
  Categories: Categories[] = [];
  customers: Customer[] = [];
  countries: any[] = [];
  locations: any[] = [];
  selectedCategory: Categories | null = null;
  selectedCustomer: Customer | null = null;
  selectedCountry: any = null;
  selectedLocation: any = null;
  expenses: any[] = [];
  totalRecords = 0;

  // Date filter state
  selectedFilter: FilterKey = 'thisMonth';
  showCustomDates = false;
  customFromDate: string = '';
  customToDate: string = '';
  filterOptions: { key: FilterKey; label: string }[] = [];

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
    categoryId: undefined,
    countryId: undefined,
    locationId: undefined,
  };

  constructor(
    private expenseService: ExpenseService,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private countryService: CountryService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToasterService,
    private modalPrintService: NgbModal,
    private commonUtil: CommonUtil,
    private dateFilterService: DateFilterService,
    private currencyService: CurrencyService,
    private currencyFormatService: CurrencyFormatService,
  ) {}

  ngOnInit(): void {
    this.filterOptions = this.dateFilterService.options;
    this.loadActiveCurrency();
    this.loadExpenses();
    const currentUser = this.commonUtil.getCurrentUser();
    if (currentUser && currentUser.role !== UserRole.Admin) {
      this.filters.userId = currentUser.userId ?? undefined;
    } else {
      this.filters.userId = undefined;
    }
    this.loadInitialData();
  }

  onFilterChange(key: FilterKey): void {
    this.selectedFilter = key;
    this.showCustomDates = key === 'custom';
    if (key !== 'custom') {
      const params = this.dateFilterService.buildParams(key);
      this.filters.fromDate = params.fromDate;
      this.filters.toDate = params.toDate;
    }
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  onCustomDateChange(): void {
    if (this.selectedFilter === 'custom' && this.customFromDate && this.customToDate) {
      const params = this.dateFilterService.buildParams(
        'custom',
        new Date(this.customFromDate),
        new Date(this.customToDate)
      );
      this.filters.fromDate = params.fromDate;
      this.filters.toDate = params.toDate;
      this.filters.pageNumber = 1;
      this.loadExpenses();
    }
  }

  private loadInitialData(): void {
    this.isLoading = true;
    Promise.all([
      this.loadExpenses(),
      this.loadAllExpenceCategories(),
      this.loadAllCustomers(),
      this.loadAllCountries(),
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

  onCountrySelect(selectedCountry: any): void {
    this.selectedCountry = selectedCountry;
    this.selectedLocation = null;
    this.locations = [];
    this.filters.countryId = selectedCountry?.countryId || undefined;
    this.filters.locationId = undefined;
    if (selectedCountry?.countryId) {
      this.loadLocationsByCountry(selectedCountry.countryId);
    }
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  onLocationSelect(selectedLocation: any): void {
    this.selectedLocation = selectedLocation;
    this.filters.locationId = selectedLocation?.locationId || undefined;
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

  onCategoryFilter(CategoryId: string) {
    this.filters.categoryId = CategoryId || undefined;
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
        console.error('Error loading categories', err);
        this.isLoading = false;
      },
    });
  }

  loadAllCustomers(): void {
    this.isLoading = true;
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customers', err);
        this.isLoading = false;
      },
    });
  }

  loadAllCountries(): void {
    this.isLoading = true;
    this.countryService.getActiveCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading countries', err);
        this.isLoading = false;
      },
    });
  }

  loadLocationsByCountry(countryId: string): void {
    this.countryService.getLocationsByCountry(countryId).subscribe({
      next: (locations) => {
        this.locations = locations;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading locations', err);
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
    console.log('selectedCustomer:', selectedCustomer);
    this.onCustomerFilter(this.selectedCustomer?.customerId);
  }

  resetFilters() {
    const currentUser = this.commonUtil.getCurrentUser();
    const isAdmin = currentUser && currentUser.role === UserRole.Admin;
    this.selectedFilter = 'thisMonth';
    this.showCustomDates = false;
    this.customFromDate = '';
    this.customToDate = '';
    const params = this.dateFilterService.buildParams('thisMonth');
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: '',
      sortDirection: 'asc',
      fromDate: params.fromDate,
      toDate: params.toDate,
      minAmount: undefined,
      maxAmount: undefined,
      minPaid: undefined,
      maxPaid: undefined,
      minBalance: undefined,
      maxBalance: undefined,
      customerId: undefined,
      categoryId: undefined,
      countryId: undefined,
      locationId: undefined,
      userId: isAdmin ? undefined : (currentUser?.userId ?? undefined),
    };
    this.selectedCategory = null;
    this.selectedCustomer = null;
    this.selectedCountry = null;
    this.selectedLocation = null;
    this.selectedPaymentStatus = null;
    this.loadExpenses();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.selectedCategory ||
      this.selectedCustomer ||
      this.selectedCountry ||
      this.selectedLocation ||
      this.filters.fromDate ||
      this.filters.toDate ||
      this.filters.minAmount !== undefined ||
      this.filters.maxAmount !== undefined ||
      this.selectedPaymentStatus ||
      this.filters.minPaid !== undefined ||
      this.filters.maxPaid !== undefined ||
      this.filters.minBalance !== undefined ||
      this.filters.maxBalance !== undefined
    );
  }

  clearCategory(): void {
    this.selectedCategory = null;
    this.filters.categoryId = undefined;
    this.loadExpenses();
  }

  clearCustomer(): void {
    this.selectedCustomer = null;
    this.filters.customerId = undefined;
    this.loadExpenses();
  }

  clearCountry(): void {
    this.selectedCountry = null;
    this.selectedLocation = null;
    this.locations = [];
    this.filters.countryId = undefined;
    this.filters.locationId = undefined;
    this.loadExpenses();
  }

  clearLocation(): void {
    this.selectedLocation = null;
    this.filters.locationId = undefined;
    this.loadExpenses();
  }

  clearDate(): void {
    this.selectedFilter = 'thisMonth';
    this.showCustomDates = false;
    this.customFromDate = '';
    this.customToDate = '';
    const params = this.dateFilterService.buildParams('thisMonth');
    this.filters.fromDate = params.fromDate;
    this.filters.toDate = params.toDate;
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

  editExpense(expense: any) {
    console.log(expense);
    this.router.navigate(['/features/ExpenseCreation'], {
      state: { expense: expense },
    });
  }

  showExpenceDetails(expense: any): void {
    const modalRef = this.modalService.open(IncomeDetailsPopupComponent, {
      centered: true,
      size: 'xl',
      windowClass: 'income-details-modal',
    });
    modalRef.componentInstance.income = expense;
    console.log(expense);
  }

  openExportModal(): void {
    const modalRef = this.modalService.open(ExportModalComponent, {
      centered: true,
      size: 'md',
      windowClass: 'export-modal',
      animation: false,
    });

    modalRef.componentInstance.exportRequested.subscribe(
      (format: 'excel' | 'csv') => {
        if (format === 'excel') {
          this.exportToExcel();
        } else {
          this.exportToCsv();
        }
        modalRef.close();
      }
    );

    modalRef.componentInstance.modalClosed.subscribe(() => {
      modalRef.close();
    });
  }

  exportToExcel(): void {}

  exportToCsv(): void {}

  deleteExpense(expenseId: string): void {
    this.modalService
      .confirm(
        'Delete Expense',
        'Are you sure you want to delete this expense?'
      )
      .then((confirmed) => {
        if (confirmed) {
          this.expenseService.deleteExpense(expenseId).subscribe({
            next: () => {
              this.toastService.success('Deleted Successfully');
              this.loadExpenses();
            },
            error: () => {},
          });
        }
      });
  }

  paymentStatusOptions = [
    { name: 'Paid', value: 'paid' },
    { name: 'Unpaid', value: 'unpaid' },
    { name: 'Partial', value: 'partial' },
  ];
  selectedPaymentStatus: any = null;

  onPaidFilter(minPaid: number | undefined, maxPaid: number | undefined) {
    this.filters.minPaid = minPaid === undefined || isNaN(minPaid) ? undefined : minPaid;
    this.filters.maxPaid = maxPaid === undefined || isNaN(maxPaid) ? undefined : maxPaid;
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  onBalanceFilter(minBalance: number | undefined, maxBalance: number | undefined) {
    this.filters.minBalance = minBalance === undefined || isNaN(minBalance) ? undefined : minBalance;
    this.filters.maxBalance = maxBalance === undefined || isNaN(maxBalance) ? undefined : maxBalance;
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  onPaymentStatusSelect(status: any) {
    this.filters.paymentStatus = status?.value;
    this.filters.pageNumber = 1;
    this.loadExpenses();
  }

  clearPaid() {
    this.filters.minPaid = undefined;
    this.filters.maxPaid = undefined;
    this.loadExpenses();
  }

  clearBalance() {
    this.filters.minBalance = undefined;
    this.filters.maxBalance = undefined;
    this.loadExpenses();
  }

  clearPaymentStatus() {
    this.filters.paymentStatus = undefined;
    this.selectedPaymentStatus = null;
    this.loadExpenses();
  }

  getPaymentStatusLabel(status: string): string {
    return this.paymentStatusOptions.find(opt => opt.value === status)?.name || status;
  }

  PrintOut(expense: any) {
    const modalRef = this.modalPrintService.open(InvoiceTemplate3Component, {
      centered: true,
      scrollable: false,
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.expenseData = expense;
  }

  private loadActiveCurrency(): void {
    this.currencyService.getActiveCurrencies().subscribe({
      next: (currencies) => {
        if (currencies && currencies.length > 0) {
          this.currencyFormatService.setActiveCurrency(currencies[0]);
        }
      },
      error: () => {},
    });
  }
}
