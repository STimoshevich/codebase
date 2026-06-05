import { compactObject } from '../../components/widget-configuration/components/widget-settings/components/compact-object';

export function extractPropertiesFromObjectByName<T>(obj: T, name: string): Partial<T> {
  const result = _extractPropertiesFromObjectByName(obj, name);

  return compactObject(result) as Partial<T>;
}

function _extractPropertiesFromObjectByName<T>(obj: T, name: string): Partial<T> {
  const filteredObj: Partial<T> = {};

  for (const key in obj) {
    if (obj[key] !== undefined) {
      const value = obj[key];

      //not working with array of objects, full array will be added without deep extracting
      if (Array.isArray(value) && key.toLowerCase().includes(name)) {
        filteredObj[key] = value;
        continue;
      }

      if (typeof value === 'object' && value !== null) {
        (filteredObj[key] as Record<string, unknown>) = extractPropertiesFromObjectByName(
          value,
          name
        );
        continue;
      }

      if (key.toLowerCase().includes(name)) {
        filteredObj[key] = value;
      }
    }
  }

  return filteredObj;
}
