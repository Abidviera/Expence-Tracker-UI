import { Component } from '@angular/core';

interface Customer {
  id: string | number;
  name: string;
  // Add any other properties you need
}
@Component({
  selector: 'app-expense-creation',
  standalone: false,
  templateUrl: './expense-creation.component.html',
  styleUrl: './expense-creation.component.scss'
})


export class ExpenseCreationComponent {

  selectedCustomerId: string | number | null = null;
  customers: Customer[] = [
    { id: 'cat-1', name: 'Food & Dining' },
    { id: 'cat-2', name: 'Transportation' },
    { id: 'cat-3', name: 'Accommodation' },
    { id: 'cat-4', name: 'Entertainment' },
    { id: 'cat-5', name: 'Business Services' },
    { id: 'cat-6', name: 'Office Supplies' }
  ];


  selectedCustomer: Customer | null = null;

  constructor() { }

  ngOnInit(): void {
   
  }


  onCustomerSelect(selectedCustomer: Customer): void {
    this.selectedCustomer = selectedCustomer;
    console.log('Selected customer:', selectedCustomer);

  }

  
}
