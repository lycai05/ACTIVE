import { echartOptionProfixHandle } from '../../utils/settings'
import { VirtualCTrackMeta } from './metadata'
// import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
// import dataJson from './data.json'
// import globalJson from '../../configurations/components/setting/global.theme.json'
import type CreateTrackType from '../../elements'
import { PublicConfigClass } from '../../store/TrackStore/TrackStore'

export const includes = ['legend', 'xAxis', 'yAxis', 'grid']
export const seriesItem = {
  type: 'box',
  label: {
    show: true,
    position: 'top',
    color: '#fff',
    fontSize: 12
  },
  itemStyle: {
    color: null,
    borderRadius: 0,
    opacity: 1
  },
  lineStyle: {
    type: 'solid',
    width: 3,
    color: 'grey'
  },
  areaStyle: {
    opacity: 0.1,
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
  series: [seriesItem],
  visibilityWindow: 1000000
}

export const controllerConfig = {
  isActive: false
}

export default class Config extends PublicConfigClass implements CreateTrackType {
    public key = VirtualCTrackMeta.key
    public trackConfig = cloneDeep(VirtualCTrackMeta)
    public option = echartOptionProfixHandle(option, includes)
    public controllerConfig = controllerConfig
    // 图表配置项
    // public option = echartOptionProfixHandle(option, includes)
    constructor() {
      super(); // 调用父类的构造函数

      this.attr = {
          h: 300,
          maxHeight: 300
      };
    }
}