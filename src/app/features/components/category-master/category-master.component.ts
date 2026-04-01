import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService, CategoryCreateDto, CategoryUpdateDto, CategoryDTO } from '../../../services/category.service';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-category-master',
  standalone: false,
  templateUrl: './category-master.component.html',
  styleUrl: './category-master.component.scss',
})
export class CategoryMasterComponent implements OnInit {
  category: CategoryCreateDto = this.getEmptyCategory();
  isEditMode = false;
  isLoading = false;
  categoryId: string | null = null;

  constructor(
    private categoryService: CategoryService,
    private toasterService: ToasterService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkForEditMode();
  }

  private checkForEditMode(): void {
    const stateCategory = history.state.category;
    if (stateCategory) {
      this.activateEditMode(stateCategory);
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadCategory(id);
      }
    }
  }

  private activateEditMode(category: CategoryDTO): void {
    this.isEditMode = true;
    this.categoryId = category.id;
    this.category = {
      name: category.name || '',
      description: category.description || '',
    };
  }

  private loadCategory(id: string): void {
    this.isLoading = true;
    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.activateEditMode(category);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading category:', err);
        this.toasterService.error('Failed to load category');
        this.isLoading = false;
      },
    });
  }

  private getEmptyCategory(): CategoryCreateDto {
    return {
      name: '',
      description: '',
    };
  }

  resetForm(): void {
    this.category = this.getEmptyCategory();
  }

  submitCategory(): void {
    if (this.isLoading) return;

    if (!this.category.name || this.category.name.trim() === '') {
      this.toasterService.error('Category name is required');
      return;
    }

    this.isEditMode && this.categoryId
      ? this.updateCategory()
      : this.createCategory();
  }

  private createCategory(): void {
    this.isLoading = true;
    this.categoryService.createCategory(this.category).subscribe({
      next: () => {
        this.toasterService.success('Category created successfully');
        this.router.navigate(['/features/category']);
      },
      error: (err) => {
        console.error('Error creating category:', err);
        this.toasterService.error(err.error || 'Failed to create category');
        this.isLoading = false;
      },
    });
  }

  private updateCategory(): void {
    if (!this.categoryId) return;
    this.isLoading = true;
    const dto: CategoryUpdateDto = {
      name: this.category.name,
      description: this.category.description,
    };
    this.categoryService.updateCategory(this.categoryId, dto).subscribe({
      next: () => {
        this.toasterService.success('Category updated successfully');
        this.router.navigate(['/features/category']);
      },
      error: (err) => {
        console.error('Error updating category:', err);
        this.toasterService.error(err.error || 'Failed to update category');
        this.isLoading = false;
      },
    });
  }
}
