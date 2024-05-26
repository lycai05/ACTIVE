import { echartOptionProfixHandle } from '../../utils/settings'
import { DomainTrackMeta } from './metadata'
// import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
// import dataJson from './data.json'
// import globalJson from '../../configurations/components/setting/global.theme.json'
import type CreateTrackType from '../../elements'
import { PublicConfigClass } from '../../store/TrackStore/TrackStore'

export const includes = ['legend', 'xAxis', 'yAxis', 'grid']
export const seriesItem = {
  lineStyle: {
    // type: 'solid',
    width: 1,
    color: '#CF625F'
  },
  areaStyle: {
    opacity: 0.1,
    color: '#B84444'
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
  series: [seriesItem],
  style: 'square'
}

export default class Config extends PublicConfigClass implements CreateTrackType {
    public key = DomainTrackMeta.key
    public trackConfig = cloneDeep(DomainTrackMeta)
    public option = echartOptionProfixHandle(option, includes)
    // 图表配置项
    // public option = echartOptionProfixHandle(option, includes)
    
    constructor() {
      super(); // 调用父类的构造函数

      this.attr = {
          h: 80,
          maxHeight: 600
      };
    }
}