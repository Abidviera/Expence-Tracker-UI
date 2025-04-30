
export interface ExpensePaginationRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: string;

  fromDate?: string;
  toDate?: string;

  minAmount?: number;
  maxAmount?: number;
  customerId?: string;
  CategoryId?: string;
  tripId?: string;
}
