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
  userId?: string;
  }


  export interface PaginationResponse<T> {
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    data: T[];
  }
  