// downSample.js
import { samplers } from './samplers.ts';

/**
 * 数据采样函数
 * @param {Array<{x: number, y: number}>|number[]} data - 需要采样的数据
 * @param {object} options - 配置选项
 * @param {number} [options.targetSize] - 目标数据点数量
 * @param {number} [options.width] - 显示区域宽度(像素)
 * @param {string|function} [options.method='average'] - 采样方法
 * @param {number} [options.dpr=1] - 设备像素比
 * @returns {Array<{x: number, y: number}>|number[]} 采样后的数据
 */
export function downSample(data, options = {}) {
    if (!Array.isArray(data) || data.length === 0) {
        return [];
    }

    const {
        targetSize,
        width,
        method = 'average',
        dpr = 1
    } = options;

    // 确定最终的目标大小
    let finalTargetSize = targetSize;
    if (width && !targetSize) {
        const effectiveWidth = width * dpr;
        const rate = Math.max(1, Math.round(data.length / effectiveWidth));
        finalTargetSize = Math.ceil(data.length / rate);
    }

    // 如果没有指定targetSize和width，或数据量小于目标大小，返回原数据
    if (!finalTargetSize || data.length <= finalTargetSize) {
        return data;
    }

    // 检查数据格式
    const isCoordinateData = data[0] && typeof data[0] === 'object' && 'x' in data[0] && 'y' in data[0];

    // 如果使用LTTB算法
    if (method === 'lttb') {
        return samplers.lttb(data, finalTargetSize, isCoordinateData);
    }

    // 获取采样器
    const sampler = typeof method === 'function' ? method : samplers[method];
    if (!sampler) {
        throw new Error('Invalid sampling method');
    }

    // 计算采样窗口大小并执行采样
    const windowSize = Math.ceil(data.length / finalTargetSize);
    const result = [];
    
    for (let i = 0; i < data.length; i += windowSize) {
        const frame = data.slice(i, i + windowSize);
        result.push(sampler(frame, isCoordinateData));
    }

    return result;
}