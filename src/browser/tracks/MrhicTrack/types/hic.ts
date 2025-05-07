// types/hic.ts
export interface HiCLocation {
    chrom: string;
    start: number;
    end: number;
  }
  
  export interface ContactRecord {
    bin1: number;
    bin2: number;
    counts: number;
  }
  
  export interface MatrixFetchResult {
    success: boolean;
    data: ContactRecord[];
    isEmpty: boolean;
    error?: any;
  }
  
  export interface HiCOptions {
    url: string;
    series: Array<{
      resolution: {
        mode: string;
        selectedResolution: number;
        availableResolutions: number[];
      };
      normalization: {
        selectedNormalization: string;
        normalizationMethods: string[];
      };
      itemStyle: {
        maxScore: number;
        maxCountColor: string;
      };
    }>;
  }