import { Component } from '@angular/core';
import { IncomeService } from '../../../services/income.service';
import { Router } from '@angular/router';
import { Customer } from '../../../models/Customer.model';
import { Destinations } from '../../../models/Destinations.model';
import { Categories } from '../../../models/ExpenseCategories.model';
import { CustomerService } from '../../../services/customer.service';
import { DestinationsService } from '../../../services/destinations.service';
import { IncomePaginationRequest } from '../../../models/IncomePaginationRequest.model';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { CategoryService } from '../../../services/category.service';
import { ModalService } from '../../../services/modal.service';
import { ExportService } from '../../../services/export.service';
import { ExportModalComponent } from '../../../shared/modals/export-modal/export-modal.component';
import { animation } from '@angular/animations';
import { IncomeDetailsPopupComponent } from '../../../shared/modals/income-details-popup/income-details-popup.component';

@Component({
  selector: 'app-income-list',
  standalone: false,
  templateUrl: './income-list.component.html',
  styleUrl: './income-list.component.scss',
})
export class IncomeListComponent {
  filterSection = false;
  isLoading = false;
   exportPopup = false;
  selectedCategory: Categories | null = null;
  selectedCustomer: Customer | null = null;
  selectedDestination: Destinations | null = null;
  Categories: Categories[] = [];
  customers: Customer[] = [];
  destinations: Destinations[] = [];

  users: User[] = [];
  incomes: any[] = [];
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
    CustomerId: undefined,
    CategoryId: undefined,
    TripId: undefined,
  };

  constructor(
    private incomeService: IncomeService,
    private router: Router,
    private userService: UserService,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private destinationService: DestinationsService,
     private modalService: ModalService,
      private exportService: ExportService 
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.isLoading = true;

    Promise.all([
      this.loadIncomes(),
      this.loadAllUsers(),
      this.loadAllCategories(),
      this.loadAllCustomers(),
      this.loadAllDestinations(),
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  exportPopups(){
    this.exportPopup = !this.exportPopup
  }
  loadAllCategories(): void {
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

    private resetPagination(): void {
    this.filters.pageNumber = 1;
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
     this.resetPagination();
    this.loadIncomes();
  }

  onDateFilter(fromDate: string, toDate: string) {
    this.filters.fromDate = fromDate;
    this.filters.toDate = toDate;
      this.resetPagination();
    this.loadIncomes();
  }

  onAmountFilter(minAmount: number | undefined, maxAmount: number | undefined) {
    this.filters.minAmount = minAmount;
    this.filters.maxAmount = maxAmount;
      this.resetPagination();
    this.loadIncomes();
  }

  onUserFilter(userId?: string) {
    this.filters.userId = userId || undefined;
     this.resetPagination();
    this.loadIncomes();
  }

  onSortChange(sortColumn: string, sortDirection: string) {
    this.filters.sortColumn = sortColumn;
    this.filters.sortDirection = sortDirection;
     this.resetPagination();
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
      CustomerId: undefined,
      CategoryId: undefined,
      TripId: undefined,
    };

    this.selectedUser = null;
    this.selectedCustomer = null;
    this.selectedDestination = null;
    this.selectedCategory = null;

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
    this.modalService.confirm(
      'Delete Income',
      'Are you sure you want to delete this income?'
    ).then(confirmed => {
      if (confirmed) {
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
    });
  }

  editIncome(incomeId: string): void {
    this.router.navigate(['/features/incomes/edit', incomeId]);
    console.log(incomeId)
  }

  hasActiveFilters(): boolean {
    return !!(
      this.selectedUser ||
      this.selectedCustomer ||
      this.selectedDestination ||
      this.selectedCategory ||
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

  clearUser(): void {
    this.selectedUser = null;
    this.filters.userId = undefined;
    this.loadIncomes();
  }

  onUserSelect(selecteduser: User): void {
    this.selectedUser = selecteduser;
    console.log('selectedUser:', selecteduser);
    this.onUserFilter(this.selectedUser?.userId);
  }

  clearSelectedCustomer(): void {
    this.selectedCustomer = null;
    this.filters.CustomerId = undefined;
    this.loadIncomes();
  }

  clearSelectedDestination(): void {
    this.selectedDestination = null;
    this.filters.TripId = undefined;
    this.loadIncomes();
  }

  clearSelectedCategory(): void {
    this.selectedCategory = null;
    this.filters.CategoryId = undefined;
    this.loadIncomes();
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

  onCustomerFilter(customerId: string) {
    this.filters.CustomerId = customerId || undefined;
     this.resetPagination();
    this.loadIncomes();
  }

  onDestinationFilter(DestinationID: string) {
    this.filters.TripId = DestinationID || undefined;

    if (this.selectedDestination) {
      this.selectedDestination.id = DestinationID;
    }
     this.resetPagination();
    this.loadIncomes();
  }

  onCategoryFilter(CategoryId: string) {
    this.filters.CategoryId = CategoryId || undefined;

    if (this.selectedCategory) {
      this.selectedCategory.id = CategoryId;
    }
     this.resetPagination();
    this.loadIncomes();
  }


  openExportModal(): void {
    const modalRef = this.modalService.open(ExportModalComponent, {
      centered: true,
      size: 'md',
      windowClass: 'export-modal',
      animation: false 
    });

    modalRef.componentInstance.exportRequested.subscribe((format: 'excel' | 'csv') => {
      if (format === 'excel') {
        this.exportToExcel();
      } else {
        this.exportToCsv();
      }
      modalRef.close();
    });

    modalRef.componentInstance.modalClosed.subscribe(() => {
      modalRef.close();
    });
}


  exportToExcel(): void {
   
    const exportData = this.incomes.map(income => ({
      'User': `${income.addedByUser?.firstName} ${income.addedByUser?.lastName || ''}`,
      'Date': this.formatDateForExport(income.date),
      'Source': income.source,
      'Customer': income.customer?.name || '',
      'Category': income.category?.name || '',
      'Description': income.description || '',
      'Amount': income.amount,
      'Tax': income.tax || 0,
      'Location': income.location || '',
      'Trip': income.trip?.name || ''
    }));

    this.exportService.exportToExcel(exportData, 'incomes');
  }


  exportToCsv(): void {

    const exportData = this.incomes.map(income => ({
      'User': `${income.addedByUser?.firstName} ${income.addedByUser?.lastName || ''}`,
      'Date': this.formatDateForExport(income.date),
      'Source': income.source,
      'Customer': income.customer?.name || '',
      'Category': income.category?.name || '',
      'Description': income.description || '',
      'Amount': income.amount,
      'Tax': income.tax || 0,
      'Location': income.location || '',
      'Trip': income.trip?.name || ''
    }));

    this.exportService.exportToCsv(exportData, 'incomes');
  }

  private formatDateForExport(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }


  showIncomeDetails(income: any): void {
  const modalRef = this.modalService.open(IncomeDetailsPopupComponent, {
    centered: true,
    size: 'xl',
    windowClass: 'income-details-modal'
  });
  modalRef.componentInstance.income = income;
  console.log(income)
}
}
