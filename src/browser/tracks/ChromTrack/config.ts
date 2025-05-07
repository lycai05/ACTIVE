import { echartOptionProfixHandle } from '../../utils/settings'
import { ChromTrackMeta } from './metadata'
// import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
// import dataJson from './data.json'
import globalJson from '../../configurations/components/setting/global.theme.json'
import type CreateTrackType from '../../elements'
import { PublicConfigClass } from '../../store/TrackStore/TrackStore'
import { autoCompleteDark } from 'naive-ui'

export const includes = ['legend', 'xAxis', 'yAxis', 'grid']
export const seriesItem = {
  // type: 'box',
  label: {
    show: true,
    position: 'top',
    color: '#fff',
    fontSize: 12
  },
  itemStyle: {
    // borderRadius: 0,
    posColor: '#FBC20A',
    negColor: '#7172B5',
    opacity: 1
  }
}

export const option = {
  // tooltip: {
  //   show: true,
  //   trigger: 'axis',
  //   axisPointer: {
  //     type: 'line'
  //   }
  // },
  // xAxis: {
  //   show: false,
  //   type: 'category'
  // },
  renderer: 'svg',
  localFile: true,
  yAxis: {
    // enable: true,
    show: true,
    // type: 'value',
    scale: 'auto',
    max: 30,
    min: 0,
    log: false,
    flip: false
  },
//   dataset: { ...dataJson },
  url: '',
  series: [seriesItem]
}

export default class Config extends PublicConfigClass implements CreateTrackType {
    public key = ChromTrackMeta.key
    public trackConfig = cloneDeep(ChromTrackMeta)
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