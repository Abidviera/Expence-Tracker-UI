export interface Country {
  countryId: string;
  countryCode: string;
  countryName: string;
  region: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CountryCreateDto {
  countryCode: string;
  countryName: string;
  region: string;
  isActive: boolean;
}

export interface CountryUpdateDto {
  countryCode: string;
  countryName: string;
  region: string;
  isActive: boolean;
}

export interface CountryPaginationRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: string;
  region?: string;
  isActive?: boolean;
}

export interface Location {
  locationId: string;
  locationName: string;
  countryId: string;
  countryName: string;
  countryCode: string;
  city: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationCreateDto {
  locationName: string;
  countryId: string;
  city: string;
  isActive: boolean;
}

export interface LocationUpdateDto {
  locationName: string;
  countryId: string;
  city: string;
  isActive: boolean;
}

export interface LocationPaginationRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: string;
  countryId?: string;
  isActive?: boolean;
}

export interface ReportRequest {
  // Legacy: single month (deprecated — use FilterKey instead)
  month: number;
  year: number;
  // Universal date filter (use FilterKey instead of Month/Year for flexible ranges)
  filterKey?: string;
  fromDate?: string;
  toDate?: string;
  // Transaction filters (FK-based)
  countryId?: string;
  locationId?: string;
}

export interface ReportResponse {
  reportTitle: string;
  period: string;
  generatedOn: Date;
  generatedBy: string;
  summary: ReportSummary;
  countryBreakdown: CountryBreakdown[];
  locationBreakdown: LocationBreakdown[];
  customerDetails: CustomerReportDetail[];
}

export interface ReportSummary {
  totalCustomers: number;
  totalCountries: number;
  totalLocations: number;
  totalExpenses: number;
  totalIncome: number;
  netProfit: number;
  averageExpensePerCustomer: number;
}

export interface CountryBreakdown {
  countryName: string;
  countryCode: string;
  region: string;
  customerCount: number;
  totalExpenses: number;
  totalIncome: number;
  netProfit: number;
  customers: CustomerReportDetail[];
}

export interface LocationBreakdown {
  countryName: string;
  locationName: string;
  city: string;
  customerCount: number;
  totalExpenses: number;
  totalIncome: number;
  netProfit: number;
  customers: CustomerReportDetail[];
}

export interface CustomerReportDetail {
  customerId: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  countryName: string;
  locationName: string;
  city: string;
  visitDate: Date | null;
  totalExpenses: number;
  totalIncome: number;
  netProfit: number;
}

export interface PaginationResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: T[];
}
