// samplers.ts

// 扩展 DataPoint 类型以支持可选的额外属性
type DataPoint = {
    x: number;
    y: number;
    [key: string]: any;  // 允许任意额外属性
};

type DataArray = DataPoint[] | number[];

// 辅助函数：获取数据点的y值
function getY(point: DataPoint | number): number {
    return typeof point === 'number' ? point : point.y;
}

// 辅助函数：获取数据点的x值
function getX(point: DataPoint | number, index: number): number {
    return typeof point === 'number' ? index : point.x;
}

// 辅助函数：创建结果点，保留额外属性
function createPoint(frame: DataArray, x: number, y: number, isCoordinate: boolean, index: number): DataPoint | number {
    if (!isCoordinate) return y;
    
    // 如果是对象数组，获取原始数据点的额外属性
    const originalPoint = frame[index] as DataPoint;
    if (typeof originalPoint === 'object') {
        const result: DataPoint = { x, y };
        // 复制所有额外属性
        Object.keys(originalPoint).forEach(key => {
            if (key !== 'x' && key !== 'y') {
                result[key] = originalPoint[key];
            }
        });
        return result;
    }
    
    return { x, y };
}

export const samplers = {
    // 平均值采样
    average(frame: DataArray, isCoordinate: boolean): DataPoint | number {
        if (frame.length === 0) return isCoordinate ? { x: 0, y: 0 } : 0;
        
        let sum = 0;
        frame.forEach(point => {
            sum += getY(point);
        });
        
        const y = sum / frame.length;
        const midIndex = Math.floor(frame.length / 2);
        const x = getX(frame[midIndex], midIndex);
        
        return createPoint(frame, x, y, isCoordinate, midIndex);
    },

    // 最大值采样
    max(frame: DataArray, isCoordinate: boolean): DataPoint | number {
        if (frame.length === 0) return isCoordinate ? { x: 0, y: 0 } : 0;
        
        let maxY = -Infinity;
        let maxIndex = 0;
        
        frame.forEach((point, index) => {
            const y = getY(point);
            if (y > maxY) {
                maxY = y;
                maxIndex = index;
            }
        });
        
        const x = getX(frame[maxIndex], maxIndex);
        return createPoint(frame, x, maxY, isCoordinate, maxIndex);
    },

    // 最小值采样
    min(frame: DataArray, isCoordinate: boolean): DataPoint | number {
        if (frame.length === 0) return isCoordinate ? { x: 0, y: 0 } : 0;
        
        let minY = Infinity;
        let minIndex = 0;
        
        frame.forEach((point, index) => {
            const y = getY(point);
            if (y < minY) {
                minY = y;
                minIndex = index;
            }
        });
        
        const x = getX(frame[minIndex], minIndex);
        return createPoint(frame, x, minY, isCoordinate, minIndex);
    },

    // LTTB (Largest-Triangle-Three-Buckets) 算法
    lttb(data: DataArray, targetSize: number, isCoordinate: boolean): DataArray {
        if (targetSize >= data.length) return data;
        
        const result: DataArray = [];
        
        // 添加第一个点
        result.push(data[0]);
        
        const bucketSize = (data.length - 2) / (targetSize - 2);
        
        for (let i = 1; i < targetSize - 1; i++) {
            const bucketStart = Math.floor((i - 1) * bucketSize) + 1;
            const bucketEnd = Math.floor(i * bucketSize) + 1;
            const nextBucketEnd = Math.floor((i + 1) * bucketSize) + 1;
            
            let maxArea = -1;
            let selectedIndex = bucketStart;
            
            const a = {
                x: getX(result[result.length - 1], result.length - 1),
                y: getY(result[result.length - 1])
            };
            
            for (let j = bucketStart; j < bucketEnd; j++) {
                const b = {
                    x: getX(data[j], j),
                    y: getY(data[j])
                };
                
                // 计算下一个bucket的平均点
                let avgX = 0, avgY = 0;
                for (let k = bucketEnd; k < nextBucketEnd; k++) {
                    avgX += getX(data[k], k);
                    avgY += getY(data[k]);
                }
                avgX /= (nextBucketEnd - bucketEnd);
                avgY /= (nextBucketEnd - bucketEnd);
                
                // 计算三角形面积
                const area = Math.abs(
                    (a.x - avgX) * (b.y - a.y) -
                    (a.x - b.x) * (avgY - a.y)
                ) * 0.5;
                
                if (area > maxArea) {
                    maxArea = area;
                    selectedIndex = j;
                }
            }
            
            result.push(data[selectedIndex]);
        }
        
        // 添加最后一个点
        result.push(data[data.length - 1]);
        
        return result;
    }
};