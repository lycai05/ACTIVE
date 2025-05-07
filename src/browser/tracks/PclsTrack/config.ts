import { echartOptionProfixHandle } from '../../utils/settings'
import { PclsTrackMeta } from './metadata'
// import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
// import dataJson from './data.json'
import globalJson from '../../configurations/components/setting/global.theme.json'
import type CreateTrackType from '../../elements'
import { PublicConfigClass } from '../../store/TrackStore/TrackStore'

export const includes = ['legend', 'xAxis', 'yAxis', 'grid']
export const seriesItem = {
  type: 'segment',
  // label: {
  //   show: true,
  //   position: 'top',
  //   color: '#fff',
  //   fontSize: 12
  // },
  itemStyle: {
    color: '#546B8A',
    // borderRadius: 0,
    opacity: 1
  },
  lineStyle: {
    type: 'dashed',
    width: 0.2,
    color: '#546B8A'
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
  sortY: {
    sortBy: 'color',
    colorField: 'score',
    sortOrder: 'desc'
  },
//   dataset: { ...dataJson },
  url: '',
  series: [seriesItem]
}

export default class Config extends PublicConfigClass implements CreateTrackType {
    public key = PclsTrackMeta.key
    public trackConfig = cloneDeep(PclsTrackMeta)
    public option = echartOptionProfixHandle(option, includes)
    // 图表配置项
    // public option = echartOptionProfixHandle(option, includes)
    constructor() {
      super(); // 调用父类的构造函数

      this.attr = {
          h: 120,
          minHeight: 100,
          maxHeight: 1000
      };
    }
}