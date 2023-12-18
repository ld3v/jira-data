import { SelectProps } from "antd";
import { get } from "lodash";
import { useMemo } from "react";

const useSelectOptions = <T extends any>(
  data: T[] = [],
  dataKey: keyof T,
  dataLabel: keyof T
): [{ value: string; label: React.ReactNode }[], Record<string, T>] => {
  const optionDic = useMemo(() => {
    const res: Record<string, any> = {};
    const options = data.map((dataItem) => {
      const dataItemKey = get(dataItem, dataKey);
      res[dataItemKey] = dataItem;

      return {
        value: dataItemKey,
        label: get(dataItem, dataLabel),
      };
    });

    return {
      options,
      dic: res,
    };
  }, [data]);

  return [optionDic.options, optionDic.dic];
};

export default useSelectOptions;
