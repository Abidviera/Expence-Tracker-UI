

export interface Expense {
  expenseId: string;
  title: string;
  categoryId: string;
  tripId?: string;
  tax?: number;
  amount: number;
  paid: number; 
  balance: number; 
  currency: string;
  date: Date;
  paymentMethod?: string;
  location?: string;
  description?: string;
  customerId?: string;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  }


  export interface ExpenseCreate {
    
    title: string ;
    categoryId?: string;
    tripId?: string;
    tax?: number;
    amount: number;
     paid: number;
    currency: string;
    date: Date;  
    paymentMethod?: string;
    location?: string;
    description?: string;
    customerId?: string;
    createdByUserId: string;
  }


  export interface ExpenseUpdateDto {
  title?: string;
  categoryId?: string;
  tripId?: string;
  amount?: number;
   paid?: number;
  tax?: number;
  currency?: string;
  date?: Date;
  paymentMethod?: string;
  location?: string;
  description?: string;
  customerId?: string;
}