declare module 'hic-straw/dist/hic-straw.min.js' {
  export default class HicStraw {
    constructor(options: { url: string });
    
    getContactRecords(
      normalization: string, 
      region1: { chr: string, start: number, end: number }, 
      region2: { chr: string, start: number, end: number }, 
      units: string, 
      resolution: number
    ): Promise<Array<{ bin1: number, bin2: number, counts: number }>>;
    
    getNormalizationOptions(): Promise<string[]>;
    
    getResolutions(): Promise<number[]>;
  }
} 