import { Injectable } from '@angular/core';

export type FilterKey = 'today' | 'last7days' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';

export interface DateFilterOption {
  key: FilterKey;
  label: string;
}

export interface DateFilterParams {
  filterKey: FilterKey;
  fromDate: string;
  toDate: string;
}

@Injectable({ providedIn: 'root' })
export class DateFilterService {
  readonly options: DateFilterOption[] = [
    { key: 'today', label: 'Today' },
    { key: 'last7days', label: 'Last 7 Days' },
    { key: 'thisWeek', label: 'This Week' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'thisYear', label: 'This Year' },
    { key: 'custom', label: 'Custom Range' },
  ];

  /**
   * Computes the query parameters for the selected filter.
   * The backend expects: filterKey, fromDate (ISO), toDate (ISO)
   * where toDate is EXCLUSIVE (the first moment NOT included).
   */
  buildParams(
    filterKey: FilterKey,
    customFrom?: Date,
    customTo?: Date
  ): DateFilterParams {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    let from: Date;
    let to: Date;

    switch (filterKey) {
      case 'today':
        from = today;
        to = tomorrow;
        break;
      case 'last7days':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        to = tomorrow;
        break;
      case 'thisWeek':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        to = tomorrow;
        break;
      case 'thisMonth':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'thisYear':
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case 'custom':
        from = customFrom
          ? new Date(customFrom.getFullYear(), customFrom.getMonth(), customFrom.getDate())
          : today;
        to = customTo
          ? new Date(customTo.getFullYear(), customTo.getMonth(), customTo.getDate() + 1)
          : tomorrow;
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    return {
      filterKey: 'custom',
      fromDate: from.toISOString(),
      toDate: to.toISOString(),
    };
  }
}
