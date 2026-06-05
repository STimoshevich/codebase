declare const brand: unique symbol;

export type TBrand<T, TBrand> = T & { [brand]: TBrand };
