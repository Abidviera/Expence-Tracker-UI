export interface IncomePaginationRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  minPaid?: number;
  maxPaid?: number;
  minBalance?: number;
  maxBalance?: number;
  userId?: string;
  CategoryId?: string;
  TripId?: string;
  CustomerId?: string;
  paymentStatus?: 'Paid' | 'Partial' | 'Unpaid';
}

export interface PaginationResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: T[];
}
