import { User } from "./user.model";

export interface Income {
    incomeId: string;
    source: string;
    amount: number;
    date: Date;
    description?: string;
    addedBy: string;
    createdAt: Date;
    updatedAt: Date;
    user?: User;
  }
  
  export interface IncomeDto {
    incomeId?: string;
    source: string;
    amount: number;
    date: Date;
    description?: string;
    addedBy: string;
  }