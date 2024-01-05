import { get } from "lodash";

export const arrayToDictionary = <T = any, E = any>(
  array: T[],
  keyIndex: keyof T = "id" as keyof T,
  extraProps: any = {}
): { dic: Record<string, T & E>; keys: string[] } => {
  const dic: Record<string, T & E> = {};
  const keys = array.map((arrayItem) => {
    const key = get(arrayItem, keyIndex);
    dic[key] = { ...extraProps, ...arrayItem };
    return key;
  });

  return { dic, keys };
};

export const arrayToDicIfOk = <T = any, E = object>(
  array?: T[],
  keyIndex: keyof T = "id" as keyof T,
  extraProps: any = {}
): Record<string, T & E> =>
  Array.isArray(array) && array.length > 0
    ? arrayToDictionary(array, keyIndex, extraProps).dic
    : {};

export const uniqueArr = <T>(arr: T[]): T[] => Array.from(new Set([...arr]));
