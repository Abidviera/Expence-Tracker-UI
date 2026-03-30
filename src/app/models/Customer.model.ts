export interface Customer {
  customerId: string;
  name: string;
  email: string;
  phoneNumber: string;
  countryId?: string;
  country: string;
  locationId?: string;
  location: string;
  address: string;
  createdAt: Date;
}

export interface CustomerCreateDto {
  name: string;
  email: string;
  phoneNumber: string;
  countryId?: string;
  country: string;
  locationId?: string;
  location: string;
  address: string;
}

export interface CustomerPaginationRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: string;
  country?: string;
}

export interface PaginationResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: T[];
}
