import { echartOptionProfixHandle } from '../../utils/settings'
import { HicTrackMeta } from './metadata'
// import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
// import dataJson from './data.json'
// import globalJson from '../../configurations/components/setting/global.theme.json'
import type CreateTrackType from '../../elements'
import { PublicConfigClass } from '../../store/TrackStore/TrackStore'
import { autoCompleteDark } from 'naive-ui'

export const includes = ['legend', 'xAxis', 'yAxis', 'grid']
export const seriesItem = {
  // type: 'square',
  label: {
    show: true,
    position: 'top',
    color: '#fff',
    fontSize: 12
  },
  itemStyle: {
    zeroColor: '#ffffff',
    minCountColor: 'white',
    maxCountColor: '#e6331a',
    // borderRadius: 0,
    opacity: 0.8,
    maxScore: 100
  },
  // lineStyle: {
  //   type: 'solid',
  //   width: 3,
  //   color: 'blue'
  // }
  resolution: {
    mode: 'auto',
    selectedResolution: 100000,
    availableResolutions: []
  },
  normalization: {
    selectedNormalization: 'NONE',
    normalizationMethods: []
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
    type: 'value',
    flip: false

  },
  renderer: 'canvas',
//   dataset: { ...dataJson },
  url: '',
  series: [seriesItem],
  style: 'square'
}

export default class Config extends PublicConfigClass implements CreateTrackType {
    public key = HicTrackMeta.key
    public trackConfig = cloneDeep(HicTrackMeta)
    public option = echartOptionProfixHandle(option, includes)
    // 图表配置项
    // public option = echartOptionProfixHandle(option, includes)
    constructor() {
      super(); // 调用父类的构造函数

      this.attr = {
          h: 1000,
          maxHeight: 7000,
          minHeight: 100
      };
    }
}