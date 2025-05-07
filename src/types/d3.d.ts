declare module 'd3' {
  export function select(selector: string | Element): Selection;
  export function min<T>(array: T[], accessor?: (datum: T, index: number, array: T[]) => number): number | undefined;
  export function max<T>(array: T[], accessor?: (datum: T, index: number, array: T[]) => number): number | undefined;
  
  export interface Selection {
    append(name: string): Selection;
    attr(name: string, value: any): Selection;
    style(name: string, value: any): Selection;
    node(): Element;
    select(selector: string): Selection;
  }
} 