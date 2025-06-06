import { DateRange } from "@angular/material/datepicker";
import moment from "moment";
import { calculateDateRange } from "app/core/basic-datatypes/date/date-range-filter/date-range-filter-panel/date-range-utils";
import { isValidDate } from "../../../utils/utils";
import { Entity } from "../../entity/model/entity";
import { DataFilter, Filter } from "./filters";
import { DateRangeFilterConfigOption } from "../../entity-list/EntityListConfig";
import { DateRangeFilterComponent } from "../../basic-datatypes/date/date-range-filter/date-range-filter.component";

/**
 * Represents a filter for date values.
 * The filter can either be one of the predefined options or two manually entered dates.
 */
export class DateFilter<T extends Entity> extends Filter<T> {
  override component = DateRangeFilterComponent;

  constructor(
    public override name: string,
    public override label: string = name,
    public rangeOptions: DateRangeFilterConfigOption[],
  ) {
    super(name, label);
    this.selectedOptionValues = [];
  }

  /**
   * Returns the date range according to the selected option or dates
   */
  getDateRange(): DateRange<Date> {
    const selectedOption = this.getSelectedOption();
    if (selectedOption) {
      return calculateDateRange(selectedOption);
    }
    const dates = this.selectedOptionValues;
    if (dates?.length === 2) {
      return this.getDateRangeFromDateStrings(dates[0], dates[1]);
    }
    return new DateRange(undefined, undefined);
  }

  getFilter(): DataFilter<T> {
    const range = this.getDateRange();
    const filterObject: { $gte?: string; $lte?: string } = {};
    if (range.start) {
      filterObject.$gte = moment(range.start).format("YYYY-MM-DD");
    }
    if (range.end) {
      filterObject.$lte = moment(range.end).format("YYYY-MM-DD");
    }
    return filterObject.$gte || filterObject.$lte
      ? ({ [this.name]: filterObject } as DataFilter<T>)
      : ({} as DataFilter<T>);
  }

  getSelectedOption() {
    return this.rangeOptions[this.selectedOptionValues as any];
  }

  private getDateRangeFromDateStrings(
    dateStr1: string,
    dateStr2: string,
  ): DateRange<Date> {
    const date1 = moment(dateStr1).toDate();
    const date2 = moment(dateStr2).toDate();

    return new DateRange(
      isValidDate(date1) ? date1 : undefined,
      isValidDate(date2) ? date2 : undefined,
    );
  }
}
