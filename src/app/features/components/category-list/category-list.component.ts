import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService, CategoryDTO, CategoryPaginationRequest } from '../../../services/category.service';
import { ModalService } from '../../../services/modal.service';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-category-list',
  standalone: false,
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  filterSection = false;
  isLoading = false;
  categories: CategoryDTO[] = [];
  totalRecords = 0;

  filters: CategoryPaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: 'asc',
  };

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getPagedCategories(this.filters).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.isLoading = false;
      },
    });
  }

  toggleFilters(): void {
    this.filterSection = !this.filterSection;
  }

  onSearchChange(searchTerm: string): void {
    this.filters.searchTerm = searchTerm;
    this.filters.pageNumber = 1;
    this.loadCategories();
  }

  onSortChange(sortColumn: string, sortDirection: string): void {
    this.filters.sortColumn = sortColumn;
    this.filters.sortDirection = sortDirection;
    this.filters.pageNumber = 1;
    this.loadCategories();
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: '',
      sortDirection: 'asc',
    };
    this.loadCategories();
  }

  hasActiveFilters(): boolean {
    return false;
  }

  nextPage(): void {
    this.filters.pageNumber++;
    this.loadCategories();
  }

  previousPage(): void {
    if (this.filters.pageNumber && this.filters.pageNumber > 1) {
      this.filters.pageNumber--;
      this.loadCategories();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.filters.pageNumber = page;
      this.loadCategories();
    }
  }

  getStartItem(): number {
    return ((this.filters.pageNumber || 1) - 1) * (this.filters.pageSize || 10) + 1;
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

  editCategory(id: string): void {
    this.router.navigate(['/features/category/edit', id]);
  }

  deleteCategory(id: string): void {
    this.modalService
      .confirm('Delete Category', 'Are you sure you want to delete this category? This action cannot be undone.')
      .then((confirmed) => {
        if (confirmed) {
          this.categoryService.deleteCategory(id).subscribe({
            next: () => {
              this.toastService.success('Category deleted successfully');
              this.loadCategories();
            },
            error: (err) => {
              console.error('Error deleting category:', err);
              this.toastService.error(err.error || 'Failed to delete category');
            },
          });
        }
      });
  }

  navigateToCreate(): void {
    this.router.navigate(['/features/category/new']);
  }
}
