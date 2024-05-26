import { echartOptionProfixHandle } from '../../utils/settings'
import { InterChromCurvTrackMeta } from './metadata'
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
    show: true,
    type: 'value'
  },
//   dataset: { ...dataJson },
  url: '',
  series: [seriesItem]
}

export default class Config extends PublicConfigClass implements CreateTrackType {
    public key = InterChromCurvTrackMeta.key
    public trackConfig = cloneDeep(InterChromCurvTrackMeta)
    public option = echartOptionProfixHandle(option, includes)
    // 图表配置项
    // public option = echartOptionProfixHandle(option, includes)
}