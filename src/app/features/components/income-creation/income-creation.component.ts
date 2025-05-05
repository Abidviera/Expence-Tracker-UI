import { Component } from '@angular/core';
import { CommonUtil } from '../../../shared/utilities/CommonUtil';
import { ActivatedRoute, Router } from '@angular/router';
import { IncomeService } from '../../../services/income.service';
import { IncomeDto } from '../../../models/Income.model';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-income-creation',
  standalone: false,
  templateUrl: './income-creation.component.html',
  styleUrl: './income-creation.component.scss',
})
export class IncomeCreationComponent {
  income: IncomeDto = {
    incomeId: undefined,
    source: '',
    amount: 0,
    date: new Date(),
    description: '',
    addedBy: '',
  };
  isEditMode = false;
  constructor(
    private incomeService: IncomeService,
    private commonUtil: CommonUtil,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToasterService
  ) {}

  ngOnInit(): void {
    const incomeId = this.route.snapshot.paramMap.get('id');
    if (incomeId) {
      this.isEditMode = true;
      this.loadIncomeForEdit(incomeId);
    } else {
      this.income.addedBy = this.commonUtil.getCurrentUser()?.userId ?? '';
    }
  }

  loadIncomeForEdit(incomeId: string): void {
    this.incomeService.getIncomeById(incomeId).subscribe({
      next: (income) => {
        this.income = {
          incomeId: income.incomeId,
          source: income.source,
          amount: income.amount,
          date: new Date(income.date),
          description: income.description || '',
          addedBy: income.addedBy,
        };
      },
      error: () => {
        this.toastService.error('Error loading income for edit');
        this.router.navigate(['/incomes']);
      },
    });
  }
  submitIncome(): void {
    if (this.isEditMode && this.income.incomeId) {
      this.incomeService
        .updateIncome(this.income.incomeId, this.income)
        .subscribe({
          next: () => {
            this.router.navigate(['/incomes']);
            this.toastService.success('Updated Successfully');
          },
          error: (err) => {
            this.toastService.error('Error updating income:', err);
          },
        });
    } else {
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
  }

  resetForm(): void {
    this.income = {
      source: '',
      amount: 0,
      date: new Date(),
      addedBy: this.commonUtil.getCurrentUser()?.userId ?? '',
    };
  }

  // private validateForm(): boolean {
  //   if (
  //     !this.income.source ||
  //     this.income.amount <= 0 ||
  //     !this.income.addedBy
  //   ) {
     
  //     return false;
  //   }
  //   return true;
  // }
}
