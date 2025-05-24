import { User } from "./user.model";

export interface Income {
    incomeId: string;
  source: string;
  categoryId: string;
  tripId?: string;
  amount: number;
   paid: number;
  tax?: number;
  date: Date;
  location?: string;
  description?: string;
  customerId?: string;
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
  addedByUser?: User;
  }
  
  export interface IncomeDto {
   incomeId?: string; 
   source: string;
  categoryId: string;
  tripId?: string;
  amount: number;
    paid: number;
  tax?: number;
  date: Date;
  location?: string;
  description?: string;
  customerId?: string;
  addedBy: string;
  }