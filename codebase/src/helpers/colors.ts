import {TBrand} from "../types/brand-type";

export type TCssVariable = TBrand<string, 'CssVariable'>;
export type TCssVariableWithVarPrefix = TBrand<string, 'TCssVariableWithVarPrefix'>;
export type TRGBColor = TBrand<number[], 'TRGBColor'>;
export type TRGBString = TBrand<string, 'TRGBString'>;
export type THexColor = TBrand<string, 'THexColor'>;

const RGB_STRING_START = 'rgb(';
const RGB_STRING_END = ')';

export function isRGBString(x: string): x is TRGBString {
  return x.startsWith(RGB_STRING_START) && x.endsWith(RGB_STRING_END);
}

export function getRgbValue(x: TRGBString): TRGBColor {
  return x
    .replace(RGB_STRING_START, '')
    .replace(RGB_STRING_END, '')
    .split(',')
    .map((x) => parseInt(x)) as TRGBColor;
}


export function isCssVariable(value: string): value is TCssVariable {
  return value.startsWith('--');
}

export function isCssVariableWithPrefix(value: string): value is TCssVariableWithVarPrefix {
  return String(value).startsWith('var(--') && String(value).endsWith(')');
}

export function toTCssVariable(cssVariable: TCssVariableWithVarPrefix): TCssVariable {
  const result = String(cssVariable).replace('var(', '').replace(')', '');

  return result as TCssVariable;
}


export function isHexColor(value: string): value is THexColor {
  const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
  return hexColorRegex.test(value);
}

export function toHex(x: number): THexColor {
  let hex = x.toString(16);
  while (hex.length < 2) {
    hex = '0' + hex;
  }
  return hex as THexColor;
}

export function convertColorWordToHexColor(
  colorName: string,
  document: Document
): THexColor | null {
  const element = document.createElement('div');
  element.style.color = colorName;
  document.body.appendChild(element);

  const computedColor = getComputedStyle(element).color;
  const rgb = isRGBString(computedColor) ? getRgbValue(computedColor) : [0, 0, 0];

  document.body.removeChild(element);

  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}` as THexColor;
}
