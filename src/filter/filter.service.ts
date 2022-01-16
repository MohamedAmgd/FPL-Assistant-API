import { Injectable } from '@nestjs/common';
import { FilterOptions } from './filter-options';

@Injectable()
export class FilterService {
    filterAndSortList(list: any[], filterOptions: FilterOptions) {
        list = list.filter(element => this.filter(element, filterOptions));
        return list.sort((a, b) => this.sort(a, b, filterOptions));
    }

    filter(element: any, filterOptions: FilterOptions): boolean {
        if (element[filterOptions.key]) {
            let isMoreThanOrEqualMinValue = true;
            let isLessThanOrEqualMaxValue = true;
            if (filterOptions.min_value) {
                isMoreThanOrEqualMinValue = element[filterOptions.key] >= filterOptions.min_value;
            }
            if (filterOptions.max_value) {
                isLessThanOrEqualMaxValue = element[filterOptions.key] <= filterOptions.max_value;
            }
            return isMoreThanOrEqualMinValue && isLessThanOrEqualMaxValue;
        }
        return false;
    }

    sort(elementA: any, elementB: any, filterOptions: FilterOptions): number {
        if (elementA[filterOptions.key] && elementB[filterOptions.key]) {
            if (filterOptions.sort_dir === "asc") {
                return elementA[filterOptions.key] > elementB[filterOptions.key] ? 1 : -1;
            }
            return elementA[filterOptions.key] > elementB[filterOptions.key] ? -1 : 1;
        }
        return 1;
    }
}
