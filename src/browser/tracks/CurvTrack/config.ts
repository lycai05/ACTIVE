import { echartOptionProfixHandle } from '@/browser/utils/settings'
import { CurvTrackMeta } from './metadata'
// import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
// import dataJson from './data.json'
// import globalJson from '../../configurations/components/setting/global.theme.json'
import type CreateTrackType from '../../elements'
import { PublicConfigClass } from '../../store/TrackStore/TrackStore'

export const includes = [ 'yAxis', 'grid', 'tooltip', 'xAxis']
export const seriesItem = {
  type: 'line',
  lineStyle: {
    width: 1,
    color: '#CF625F',
    opacity: 1
  },
  areaStyle: {
    opacity: 0.1,
    color: '#B84444'
  }
}

export const option = {
  style: 'basicCurv',
  animation: false,
  tooltip: {
    trigger: 'item',
    triggerOn: 'click',
    position: 'top',
    extraCssText: 'z-index: 9999',
    appendToBody: true,
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderColor: 'rgba(80, 80, 80, 0.9)',
    textStyle: { color: '#fff' }
  },
  grid: {
    show: false,
    left: '30px',
    right: '0px',
    bottom: '1px',
    top: '0px',
    containLabel: false,
  },
  renderer: 'canvas',
  data: {
    show: 'both'
  },
  xAxis: {
    type: 'value',
    show: false,
    animation: true,
  },
  yAxis: {
    show: true,
    scale: 'auto',
    axisTick: { show: true, length: 4 },
    splitLine: { show: false },
    max: 10,
    min: 0,
    log: true,
    flip: false,
    type: 'value',
    offset: 0,            
    inverse: false,
    axisLabel: {
      margin: 6,
      color: 'black',
      verticalAlignMinLabel: 'bottom',
      verticalAlignMaxLabel: 'top'
    },
  },
//   dataset: { ...dataJson },
  url: '',
  series: [seriesItem]
}

export default class Config extends PublicConfigClass implements CreateTrackType {
    public key = CurvTrackMeta.key
    public trackConfig = cloneDeep(CurvTrackMeta)
    public option = echartOptionProfixHandle(option, includes)
    // 图表配置项
    constructor() {
      super(); // 调用父类的构造函数

      this.attr = {
          h: 60,
          maxHeight: 500
      };
    }
}