// models/expense-pagination-request.model.ts
export interface ExpensePaginationRequest {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    sortColumn?: string;
    sortDirection?: string;
    
    fromDate?: string;  // use string (ISO format) for dates
    toDate?: string;
    
    category?: number; // if ExpenseCategory is enum
    minAmount?: number;
    maxAmount?: number;
    customerId?: string;
    tripId?: string;
  }
  