// services/HiCStrawService.ts
import HicStraw from 'hic-straw/dist/hic-straw.min.js';
import type { MatrixFetchResult, ContactRecord } from './types/hic';

export class HiCStrawService {
  private straw: any;

  constructor(url: string) {
    this.straw = new HicStraw({ url });
  }

  async fetchMetadata() {
    try {
      const metadata = await this.straw.getMetaData();
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  }

  async fetchResolutions(): Promise<number[]> {
    try {
      const metadata = await this.fetchMetadata();
      return metadata['resolutions'] || [5000];
    } catch (error) {
      console.error('Error fetching resolutions:', error);
      return [5000];
    }
  }

  async fetchNormalizationMethods(): Promise<string[]> {
    try {
      const normOptions = await this.straw.getNormalizationOptions();
      return normOptions || ['NONE'];
    } catch (error) {
      console.error('Error fetching normalization methods:', error);
      return ['NONE'];
    }
  }

  async fetchContactMatrix(params: {
    normalization: string;
    chrom: string;
    start: number;
    end: number;
    resolution: number;
  }): Promise<MatrixFetchResult> {
    const { normalization, chrom, start, end, resolution } = params;
    const processedChrom = chrom.replace(/chr/g, '');

    try {
      const dataset = await this.straw.getContactRecords(
        normalization,
        { chr: processedChrom, start, end },
        { chr: processedChrom, start, end },
        "BP",
        resolution
      );

      return {
        success: true,
        data: dataset,
        isEmpty: dataset.length === 0
      };
    } catch (error) {
      console.error('Error fetching contact matrix:', error);
      return {
        success: false,
        data: [],
        isEmpty: true,
        error
      };
    }
  }

  calculateOptimalResolution(params: {
    start: number,
    end: number, 
    windowWidth: number,
    availableResolutions: number[];
  }): number {
    const { start, end, windowWidth, availableResolutions } = params;
    const genomicDistance = end - start;
    const pixelsPerBp = windowWidth / genomicDistance;
    const optimalBinSize = Math.min(1 / pixelsPerBp);
    
    const optimalResolution = availableResolutions.reduce((prev, curr) => {
      return Math.abs(curr - optimalBinSize) < Math.abs(prev - optimalBinSize) 
        ? curr 
        : prev;
    });
  
    const currentIndex = availableResolutions.indexOf(optimalResolution);
    
    // If optimalResolution is the first element, return it
    // Otherwise return the previous resolution
    if( currentIndex === 0) {
      return optimalResolution
    } else if (currentIndex === 1) {
      return availableResolutions[currentIndex - 1]
    } else {
      return availableResolutions[currentIndex - 2]
    }
  }
}

export const createHiCStrawService = (url: string) => {
  return new HiCStrawService(url);
};