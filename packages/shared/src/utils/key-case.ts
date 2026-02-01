/* eslint-disable @typescript-eslint/no-explicit-any */

import { camelCase, isArray, isObject, mapKeys, mapValues, snakeCase } from "lodash-es";

export function toCamelCase(raw: any): any {
  if (isArray(raw)) {
    return raw.map((item: any) => toCamelCase(item));
  } else if (isObject(raw)) {
    return mapKeys(
      mapValues(raw, (value: any) => toCamelCase(value)),
      (_, key: string) => camelCase(key)
    );
  }
  return raw;
}

export function toSnakeCase(raw: any): any {
  if (isArray(raw)) {
    return raw.map((item: any) => toSnakeCase(item));
  } else if (isObject(raw)) {
    return mapKeys(
      mapValues(raw, (value: any) => toSnakeCase(value)),
      (_, key: string) => snakeCase(key)
    );
  }
  return raw;
}
