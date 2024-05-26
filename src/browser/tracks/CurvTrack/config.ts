import { echartOptionProfixHandle } from '../../utils/settings'
import { CurvTrackMeta } from './metadata'
// import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
// import dataJson from './data.json'
// import globalJson from '../../configurations/components/setting/global.theme.json'
import type CreateTrackType from '../../elements'
import { PublicConfigClass } from '../../store/TrackStore/TrackStore'

export const includes = [ 'yAxis', 'grid']
export const seriesItem = {
  type: 'line',
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
  style: 'basicCurv',
  // tooltip: {
  //   show: true,
  //   trigger: 'axis',
  //   axisPointer: {
  //     type: 'line'
  //   }
  // },
  // xAxis: {
  //   show: true,
  //   type: 'category'
  // },
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
    public key = CurvTrackMeta.key
    public trackConfig = cloneDeep(CurvTrackMeta)
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