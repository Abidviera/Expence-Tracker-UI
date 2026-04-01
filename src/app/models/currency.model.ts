export interface CurrencyDTO {
  currencyId: string;
  name: string;
  code: string;
  symbol: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyCreateDto {
  name: string;
  code: string;
  symbol: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
}

export interface CurrencyUpdateDto {
  name: string;
  code: string;
  symbol: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
}

export interface CurrencyPaginationRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: string;
}
