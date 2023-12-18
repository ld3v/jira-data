import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { get } from "lodash";

dayjs.extend(customParseFormat);

export const sortByDate =
  (format = "DD/MM/YYYY") =>
  (prev: string, after: string) => {
    const fDate = dayjs(prev, format);
    const sDate = dayjs(after, format);

    return fDate.diff(sDate);
  };

export const sortByDateField =
  (dateField = "date", format = "DD/MM/YYYY") =>
  (prev: Record<string, any>, after: Record<string, any>) => {
    const fDate = dayjs(get(prev, dateField) as string, format);
    const sDate = dayjs(get(after, dateField) as string, format);

    return fDate.diff(sDate);
  };
