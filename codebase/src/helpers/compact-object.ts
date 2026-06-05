export function compactObject(data: any): Record<string, unknown> {
  if (typeof data !== 'object' ||  !data) {
    return data;
  }

  return Object.keys(data).reduce(function (accumulator, key) {
    const isObject = data[key] && typeof data[key] === 'object' && !Array.isArray(data[key]);
    const value = isObject ? compactObject(data[key]) : data[key];
    const isEmptyObject = isObject && !Object.keys(value).length;
    if (value === undefined  || value === null || isEmptyObject) {
      return accumulator;
    }

    return Object.assign(accumulator, { [key]: value });
  }, {});
}
