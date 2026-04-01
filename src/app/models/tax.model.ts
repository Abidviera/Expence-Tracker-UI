export interface TaxDTO {
  taxId: string;
  name: string;
  percentage: number;
  description?: string;
  isActive: boolean;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxCreateDto {
  name: string;
  percentage: number;
  description?: string;
  isActive: boolean;
  isEnabled: boolean;
}

export interface TaxUpdateDto {
  name: string;
  percentage: number;
  description?: string;
  isActive: boolean;
  isEnabled: boolean;
}

export interface TaxPaginationRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: string;
}
