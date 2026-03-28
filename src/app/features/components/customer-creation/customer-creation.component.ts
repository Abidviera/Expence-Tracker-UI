import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { Customer, CustomerCreateDto } from '../../../models/Customer.model';
import { ToasterService } from '../../../services/toaster.service';
import { CommonUtil } from '../../../shared/utilities/CommonUtil';

@Component({
  selector: 'app-customer-creation',
  standalone: false,
  templateUrl: './customer-creation.component.html',
  styleUrl: './customer-creation.component.scss',
})
export class CustomerCreationComponent implements OnInit {
  customer: CustomerCreateDto = this.getEmptyCustomer();
  isEditMode = false;
  isLoading = false;
  customerId: string | null = null;

  constructor(
    private customerService: CustomerService,
    private toasterService: ToasterService,
    private router: Router,
    private route: ActivatedRoute,
    private commonUtil: CommonUtil
  ) {}

  ngOnInit(): void {
    this.checkForEditMode();
  }

  private checkForEditMode(): void {
    const customer = history.state.customer;
    if (customer) {
      this.activateEditMode(customer);
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadCustomer(id);
      }
    }
  }

  private activateEditMode(customer: any): void {
    this.isEditMode = true;
    this.customerId = customer.customerId;
    this.customer = {
      name: customer.name || '',
      email: customer.email || '',
      phoneNumber: customer.phoneNumber || '',
      country: customer.country || '',
      location: customer.location || '',
      address: customer.address || '',
    };
  }

  private loadCustomer(id: string): void {
    this.isLoading = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.activateEditMode(customer);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customer:', err);
        this.toasterService.error('Failed to load customer');
        this.isLoading = false;
      },
    });
  }

  private getEmptyCustomer(): CustomerCreateDto {
    return {
      name: '',
      email: '',
      phoneNumber: '',
      country: '',
      location: '',
      address: '',
    };
  }

  resetForm(): void {
    this.customer = this.getEmptyCustomer();
  }

  submitCustomer(): void {
    if (this.isLoading) return;

    if (!this.customer.name || this.customer.name.trim() === '') {
      this.toasterService.error('Customer name is required');
      return;
    }

    this.isEditMode && this.customerId
      ? this.updateCustomer()
      : this.createCustomer();
  }

  private createCustomer(): void {
    this.isLoading = true;
    this.customerService.createCustomer(this.customer).subscribe({
      next: () => {
        this.toasterService.success('Customer created successfully');
        this.router.navigate(['/features/customers']);
      },
      error: (err) => {
        console.error('Error creating customer:', err);
        this.toasterService.error('Failed to create customer');
        this.isLoading = false;
      },
    });
  }

  private updateCustomer(): void {
    if (!this.customerId) return;
    this.isLoading = true;
    this.customerService.updateCustomer(this.customerId, this.customer).subscribe({
      next: () => {
        this.toasterService.success('Customer updated successfully');
        this.router.navigate(['/features/customers']);
      },
      error: (err) => {
        console.error('Error updating customer:', err);
        this.toasterService.error('Failed to update customer');
        this.isLoading = false;
      },
    });
  }
}
