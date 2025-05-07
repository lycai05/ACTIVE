import { echartOptionProfixHandle } from '../../utils/settings'
import { GeneTrackMeta } from './metadata'
// import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
// import dataJson from './data.json'
// import globalJson from '../../configurations/components/setting/global.theme.json'
import type CreateTrackType from '../../elements'
import { PublicConfigClass } from '../../store/TrackStore/TrackStore'

export const includes = ['legend', 'xAxis', 'yAxis', 'grid']
export const seriesItem = {
  type: 'segment',
  label: {
    show: true,
    position: 'top',
    color: 'rgb(84, 107, 138)',
    fontSize: 12
  },
  itemStyle: {
    display: 'slim',
    color: "black",
    positiveStrandColor: "rgb(0,169,157)",
    negativeStrandColor: "rgb(37, 150, 200)",
    borderRadius: 0,
    opacity: 1
  },
  lineStyle: {
    type: 'solid',
    width: 3,
    color: 'blue'
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
    enable: false,
    show: false,
    type: 'value'
  },
//   dataset: { ...dataJson },
  url: '',
  series: [seriesItem]
}

export default class Config extends PublicConfigClass implements CreateTrackType {
    public key = GeneTrackMeta.key
    public trackConfig = cloneDeep(GeneTrackMeta)
    public option = echartOptionProfixHandle(option, includes)
    // 图表配置项
    // public option = echartOptionProfixHandle(option, includes)
}