import { echartOptionProfixHandle } from '../../utils/settings'
import { HicSquareTrackMeta } from './metadata'
// import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
// import dataJson from './data.json'
// import globalJson from '../../configurations/components/setting/global.theme.json'
import type CreateTrackType from '../../elements'
import { PublicConfigClass } from '../../store/TrackStore/TrackStore'

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
    minCountColor: '#EAB9BF',
    maxCountColor: '#CF625F',
    // borderRadius: 0,
    opacity: 0.8
  },
  // lineStyle: {
  //   type: 'solid',
  //   width: 3,
  //   color: 'blue'
  // }
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
    public key = HicSquareTrackMeta.key
    public trackConfig = cloneDeep(HicSquareTrackMeta)
    public option = echartOptionProfixHandle(option, includes)
    // 图表配置项
    // public option = echartOptionProfixHandle(option, includes)
}