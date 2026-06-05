import { deepMerge } from './deep-merge';

export function extractChangedPartOfObject<T>(base: T, changed: T): Partial<T> {
  const changedPart = extractChangedProperties(base, changed);
  const newPart = extractNewProperties(base, changed);

  return deepMerge(changedPart, newPart);
}

function extractChangedProperties<T>(base: T, changed: T): Partial<T> {
  const changedProperties: Partial<T> = {};

  for (const key in base) {
    if (!isEmptyValue(base[key]) && isEmptyValue(changed[key])) {
      continue;
    }

    if (areArrays(base[key], changed[key])) {
      if (!areArraysEquals(base[key] as [], changed[key] as [])) {
        changedProperties[key] = changed[key];
      }

      continue;
    }

    if (areObjects(base[key], changed[key])) {
      const nestedChanges = extractChangedProperties(base[key], changed[key]);
      if (!isObjectEmpty(nestedChanges)) {
        (changedProperties[key] as Record<string, unknown>) = nestedChanges;
      }
      continue;
    }

    if (base[key] !== changed[key]) {
      changedProperties[key] = changed[key];
    }
  }

  return changedProperties;
}

function extractNewProperties<T>(base: T, changed: T): Partial<T> {
  const changes: Partial<T> = {};

  for (const key in changed) {
    if (isEmptyValue(changed[key])) {
      continue;
    }

    if (areArrays(base[key], changed[key])) {
      continue;
    }

    if (areObjects(base[key], changed[key])) {
      const nestedChanges = extractNewProperties(base[key], changed[key]);
      if (!isObjectEmpty(nestedChanges)) {
        (changes[key] as Record<string, unknown>) = nestedChanges;
      }
      continue;
    }

    if (base[key] !== changed[key]) {
      changes[key] = changed[key];
    }
  }

  return changes;
}

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null;
}

function isObjectEmpty(a: object): boolean {
  return !Object.keys(a).length;
}

function areObjects(a: unknown, b: unknown): boolean {
  return typeof a === 'object' && typeof b === 'object';
}

function areArrays(a: unknown, b: unknown): boolean {
  return Array.isArray(a) && Array.isArray(b);
}

function areArraysEquals<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((item) => arr2.includes(item));
}
