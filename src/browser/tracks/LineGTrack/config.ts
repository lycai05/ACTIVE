import { echartOptionProfixHandle } from '../../utils/settings'
import { LineGTrackMeta } from './metadata'
// import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
// import dataJson from './data.json'
// import globalJson from '../../configurations/components/setting/global.theme.json'
import type CreateTrackType from '../../elements'
import { PublicConfigClass } from '../../store/TrackStore/TrackStore'

export const includes = ['legend', 'xAxis', 'yAxis', 'grid']
export const seriesItem = {
  type: 'bar',
  label: {
    show: true,
    position: 'top',
    color: '#fff',
    fontSize: 12
  },
  lineStyle: {
    type: 'solid',
    width: 3,
    // color: 'rgba(217,146,17,1)'
    color: 'purple'
  },
  areaStyle: {
    opacity: 0.8,
    color: 'red'
  }
}

export const option = {
  tooltip: {
    show: true,
    trigger: 'axis',
    axisPointer: {
      type: 'line'
    }
  },
  xAxis: {
    show: true,
    type: 'category'
  },
  yAxis: {
    show: true,
    type: 'value'
  },
//   dataset: { ...dataJson },
  url: '',
  series: [seriesItem]
}

// export default class Config extends PublicConfigClass implements CreateComponentType {
//   public key: string = LineCommonConfig.key
//   public chartConfig = cloneDeep(LineCommonConfig)
//   // 图表配置项
//   public option = echartOptionProfixHandle(option, includes)
// }

export default class Config extends PublicConfigClass implements CreateTrackType {
    public key = LineGTrackMeta.key
    public trackConfig = cloneDeep(LineGTrackMeta)
    public option = echartOptionProfixHandle(option, includes)
    // 图表配置项
    // public option = echartOptionProfixHandle(option, includes)
    constructor() {
      super(); // 调用父类的构造函数

      this.attr = {
          h: 60,
          maxHeight: 500
      };
    }
}