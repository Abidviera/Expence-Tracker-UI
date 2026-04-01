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
    categoryId?: string;
    countryId?: string;
    locationId?: string;
    minPaid?: number;
    maxPaid?: number;
    minBalance?: number;
    maxBalance?: number;
    paymentStatus?: 'paid' | 'unpaid' | 'partial';
    userId?: string;
}
