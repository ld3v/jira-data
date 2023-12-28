import { DefaultOptionType } from "antd/es/select";
import { CompareFn } from "antd/es/table/interface";
import { get } from "lodash";
import { useMemo } from "react";

const useSelectOptions = <T extends any>(
  data: T[] = [],
  dataKey: keyof T,
  dataLabel: keyof T | ((item: T) => React.ReactElement | string),
  optionsSort?: CompareFn<T>
): [DefaultOptionType[], Record<string, T>] => {
  const optionDic = useMemo(() => {
    const res: Record<string, any> = {};
    let options = data.map((dataItem) => {
      const dataItemKey = get(dataItem, dataKey);
      res[dataItemKey] = dataItem;

      return {
        value: dataItemKey,
        label:
          typeof dataLabel === "function"
            ? dataLabel(dataItem)
            : get(dataItem, dataLabel),
      };
    });
    if (optionsSort)
      options = options.sort(({ value: fVal }, { value: sVal }) =>
        optionsSort(res[fVal], res[sVal])
      );

    return {
      options,
      dic: res,
    };
  }, [data]);

  return [optionDic.options, optionDic.dic];
};

export default useSelectOptions;
