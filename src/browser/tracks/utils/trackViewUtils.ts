// trackViewUtils.ts - 统一计算trackView位置和宽度的工具函数

/**
 * TrackView接口定义
 */
export interface TrackView {
  chrom: string;
  start: number;
  end: number;
  [key: string]: any;
}

/**
 * 计算视图间的间隔
 */
export const VIEWGAP = 30;

/**
 * 计算trackView的像素位置（基于累积宽度）
 * @param view 当前视图
 * @param index 视图索引
 * @param trackViews 所有视图数组
 * @param containerWidth 容器宽度
 * @param totalGenomicLength 总基因组长度或结束位置
 */
export const calculatePosition = (
  view: TrackView,
  index: number,
  trackViews: TrackView[],
  containerWidth: number,
  totalGenomicLength: number
): number => {
  let position = 0;
  for (let i = 0; i < index; i++) {
    position += trackViews[i].end - trackViews[i].start;
  }
  return position * (containerWidth / totalGenomicLength);
};

/**
 * 计算trackView的像素宽度
 * @param view 当前视图
 * @param containerWidth 容器宽度
 * @param totalGenomicLength 总基因组长度或结束位置
 */
export const calculateWidth = (
  view: TrackView,
  containerWidth: number,
  totalGenomicLength: number
): number => {
  const viewWidth = view.end - view.start;
  return viewWidth * (containerWidth / totalGenomicLength);
};

/**
 * 计算trackView的样式，包括宽度和边距
 * @param view 当前视图
 * @param index 视图索引
 * @param trackViews 所有视图数组
 * @param baseStyle 基础样式
 * @param usePercentage 是否使用百分比计算（默认为true）
 */
export const getTrackViewStyle = (
  view: TrackView,
  index: number,
  trackViews: TrackView[],
  baseStyle: Record<string, any> = {},
  usePercentage: boolean = true
): Record<string, any> => {
  // 计算所有视图的总基因组长度
  const totalLength = trackViews.reduce(
    (acc, view) => acc + (view.end - view.start),
    0
  );
  
  // 计算当前视图的宽度比例
  const viewWidth = view.end - view.start;
  
  // 计算边距
  let margin = '0 0px';
  if (index === 0) {
    margin = '0 0px 0 0';
  } else if (index === trackViews.length - 1) {
    margin = '0 0 0 0px';
  }
  
  // 返回合并后的样式
  return {
    ...baseStyle,
    width: usePercentage
      ? `${(viewWidth / totalLength) * 100}%`
      : `${viewWidth}px`,
    margin
  };
};

/**
 * 计算基因组位置到像素位置的转换
 * @param position 基因组位置
 * @param chrom 染色体
 * @param trackViews 所有视图数组
 * @param viewGap 视图间间隔
 * @param scaleFactor 缩放因子
 */
export const convertGenomicPosition = (
  position: number,
  chrom: string,
  trackViews: TrackView[],
  viewGap: number,
  scaleFactor: number
): number => {
  let convertedPosition = position;
  let cumulativeSpan = 0;

  for (let i = 0; i < trackViews.length; i++) {
    const region = trackViews[i];
    
    if (i === 0) {
      cumulativeSpan = viewGap / scaleFactor;
    } else {
      cumulativeSpan += trackViews[i - 1].end - trackViews[i - 1].start + viewGap / scaleFactor;
    }

    if (chrom === region.chrom && position >= region.start && position <= region.end) {
      convertedPosition = cumulativeSpan + (position - region.start);
      break;
    }
  }

  return convertedPosition;
}; 