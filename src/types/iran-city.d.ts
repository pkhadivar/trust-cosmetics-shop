// src/types/iran-city.d.ts

declare module "iran-city" {
    export const provinces: {
      id: number;
      name: string;
    }[];
  
    export const cities: {
      id: number;
      name: string;
      province_id: number;
    }[];
  }