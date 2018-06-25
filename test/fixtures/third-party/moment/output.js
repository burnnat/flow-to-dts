type moment$MomentOptions = {
  y: number | string,
  year: number | string,
  years: number | string,
  M: number | string,
  month: number | string,
  months: number | string,
  d: number | string,
  day: number | string,
  days: number | string,
  date: number | string,
  h: number | string,
  hour: number | string,
  hours: number | string,
  m: number | string,
  minute: number | string,
  minutes: number | string,
  s: number | string,
  second: number | string,
  seconds: number | string,
  ms: number | string,
  millisecond: number | string,
  milliseconds: number | string,
  [field: string]: any
};

type moment$MomentObject = {
  years: number,
  months: number,
  date: number,
  hours: number,
  minutes: number,
  seconds: number,
  milliseconds: number,
  [field: string]: any
};

type moment$MomentCreationData = {
  input: string,
  format: string,
  locale: Object,
  isUTC: boolean,
  strict: boolean,
  [field: string]: any
};

type moment$CalendarFormat = string | ((moment: moment$Moment) => string);

type moment$CalendarFormats = {
  sameDay: moment$CalendarFormat,
  nextDay: moment$CalendarFormat,
  nextWeek: moment$CalendarFormat,
  lastDay: moment$CalendarFormat,
  lastWeek: moment$CalendarFormat,
  sameElse: moment$CalendarFormat,
  [field: string]: any
};

declare class moment$LocaleData {
  months(moment: moment$Moment): string;
  monthsShort(moment: moment$Moment): string;
  monthsParse(month: string): number;
  weekdays(moment: moment$Moment): string;
  weekdaysShort(moment: moment$Moment): string;
  weekdaysMin(moment: moment$Moment): string;
  weekdaysParse(weekDay: string): number;
  longDateFormat(dateFormat: string): string;
  isPM(date: string): boolean;
  meridiem(hours: number, minutes: number, isLower: boolean): string;

  calendar(
    key: "sameDay" | "nextDay" | "lastDay" | "nextWeek" | "prevWeek" | "sameElse",
    moment: moment$Moment
  ): string;

  relativeTime(
    number: number,
    withoutSuffix: boolean,
    key: "s" | "m" | "mm" | "h" | "hh" | "d" | "dd" | "M" | "MM" | "y" | "yy",
    isFuture: boolean
  ): string;

  pastFuture(diff: any, relTime: string): string;
  ordinal(number: number): string;
  preparse(str: string): any;
  postformat(str: string): any;
  week(moment: moment$Moment): string;
  invalidDate(): string;
  firstDayOfWeek(): number;
  firstDayOfYear(): number;
}

declare class moment$MomentDuration {
  humanize(suffix?: boolean): string;
  milliseconds(): number;
  asMilliseconds(): number;
  seconds(): number;
  asSeconds(): number;
  minutes(): number;
  asMinutes(): number;
  hours(): number;
  asHours(): number;
  days(): number;
  asDays(): number;
  months(): number;
  asMonths(): number;
  years(): number;
  asYears(): number;
  add(value: number | moment$MomentDuration | Object, unit?: string): this;
  subtract(value: number | moment$MomentDuration | Object, unit?: string): this;
  as(unit: string): number;
  get(unit: string): number;
  toJSON(): string;
  toISOString(): string;
  isValid(): boolean;
}

declare class moment$Moment {
  ISO_8601: string;
  unix(seconds: number): moment$Moment;
  utc(): moment$Moment;
  utc(number: number | Array<number>): moment$Moment;
  utc(str: string, str2?: string | Array<string>, str3?: string): moment$Moment;
  utc(moment: moment$Moment): moment$Moment;
  utc(date: Date): moment$Moment;
  parseZone(): moment$Moment;
  parseZone(rawDate: string): moment$Moment;
  parseZone(rawDate: string, format: string | Array<string>): moment$Moment;
  parseZone(rawDate: string, format: string, strict: boolean): moment$Moment;
  parseZone(rawDate: string, format: string, locale: string, strict: boolean): moment$Moment;
  isValid(): boolean;
  invalidAt(): 0 | 1 | 2 | 3 | 4 | 5 | 6;
  creationData(): moment$MomentCreationData;
  millisecond(number: number): this;
  milliseconds(number: number): this;
  millisecond(): number;
  milliseconds(): number;
  second(number: number): this;
  seconds(number: number): this;
  second(): number;
  seconds(): number;
  minute(number: number): this;
  minutes(number: number): this;
  minute(): number;
  minutes(): number;
  hour(number: number): this;
  hours(number: number): this;
  hour(): number;
  hours(): number;
  date(number: number): this;
  dates(number: number): this;
  date(): number;
  dates(): number;
  day(day: number | string): this;
  days(day: number | string): this;
  day(): number;
  days(): number;
  weekday(number: number): this;
  weekday(): number;
  isoWeekday(number: number): this;
  isoWeekday(): number;
  dayOfYear(number: number): this;
  dayOfYear(): number;
  week(number: number): this;
  weeks(number: number): this;
  week(): number;
  weeks(): number;
  isoWeek(number: number): this;
  isoWeeks(number: number): this;
  isoWeek(): number;
  isoWeeks(): number;
  month(number: number): this;
  months(number: number): this;
  month(): number;
  months(): number;
  quarter(number: number): this;
  quarter(): number;
  year(number: number): this;
  years(number: number): this;
  year(): number;
  years(): number;
  weekYear(number: number): this;
  weekYear(): number;
  isoWeekYear(number: number): this;
  isoWeekYear(): number;
  weeksInYear(): number;
  isoWeeksInYear(): number;
  get(string: string): number;
  set(unit: string, value: number): this;

  set(
    options: {
      [field: string]: any
    }
  ): this;

  max(): moment$Moment;
  max(dates: Array<moment$Moment>): moment$Moment;
  min(): moment$Moment;
  min(dates: Array<moment$Moment>): moment$Moment;

  add(
    value: number | moment$MomentDuration | moment$Moment | Object,
    unit?: string
  ): this;

  subtract(
    value: number | moment$MomentDuration | moment$Moment | string | Object,
    unit?: string
  ): this;

  startOf(unit: string): this;
  endOf(unit: string): this;
  local(): this;
  utc(): this;
  utcOffset(offset: number | string, keepLocalTime?: boolean, keepMinutes?: boolean): this;
  utcOffset(): number;
  format(format?: string): string;
  fromNow(removeSuffix?: boolean): string;

  from(
    value: moment$Moment | string | number | Date | Array<number>,
    removePrefix?: boolean
  ): string;

  toNow(removePrefix?: boolean): string;

  to(
    value: moment$Moment | string | number | Date | Array<number>,
    removePrefix?: boolean
  ): string;

  calendar(refTime?: any, formats?: moment$CalendarFormats): string;

  diff(
    date: moment$Moment | string | number | Date | Array<number>,
    format?: string,
    floating?: boolean
  ): number;

  valueOf(): number;
  unix(): number;
  daysInMonth(): number;
  toDate(): Date;
  toArray(): Array<number>;
  toJSON(): string;
  toISOString(keepOffset?: boolean): string;
  toObject(): moment$MomentObject;

  isBefore(
    date?: moment$Moment | string | number | Date | Array<number>,
    units?: string | null | undefined
  ): boolean;

  isSame(
    date?: moment$Moment | string | number | Date | Array<number>,
    units?: string | null | undefined
  ): boolean;

  isAfter(
    date?: moment$Moment | string | number | Date | Array<number>,
    units?: string | null | undefined
  ): boolean;

  isSameOrBefore(
    date?: moment$Moment | string | number | Date | Array<number>,
    units?: string | null | undefined
  ): boolean;

  isSameOrAfter(
    date?: moment$Moment | string | number | Date | Array<number>,
    units?: string | null | undefined
  ): boolean;

  isBetween(
    fromDate: moment$Moment | string | number | Date | Array<number>,
    toDate?: moment$Moment | null | undefined | string | number | Date | Array<number>,
    granularity?: string | null | undefined,
    inclusion?: string | null | undefined
  ): boolean;

  isDST(): boolean;
  isDSTShifted(): boolean;
  isLeapYear(): boolean;
  clone(): moment$Moment;
  isMoment(obj: any): boolean;
  isDate(obj: any): boolean;
  locale(locale: string, localeData?: Object): string;
  updateLocale(locale: string, localeData?: Object | null | undefined): void;
  locale(locales: Array<string>): string;
  locale(locale: string, customization?: Object | null): moment$Moment;
  locale(): string;
  months(): Array<string>;
  monthsShort(): Array<string>;
  weekdays(): Array<string>;
  weekdaysShort(): Array<string>;
  weekdaysMin(): Array<string>;
  months(): string;
  monthsShort(): string;
  weekdays(): string;
  weekdaysShort(): string;
  weekdaysMin(): string;
  localeData(key?: string): moment$LocaleData;
  duration(value: number | Object | string, unit?: string): moment$MomentDuration;
  isDuration(obj: any): boolean;
  normalizeUnits(unit: string): string;
  invalid(object: any): moment$Moment;
}

declare module "moment" {
  export = typeof moment$Moment
}