import { defineStore } from 'pinia'
import type { CreateTrackType } from './TrackStore'
import { isString, isArray } from '@/browser/utils/type'


export type TargetChartType = {
    hoverId?: string
    selectId: string[]
}        

export interface PublicConfigType {
    isGroup: boolean
    attr: { h: number, w?: number,zIndex?:number, minHeight: number, maxHeight: number }
    // attr: { x: number; y: number; w: number; h: number; zIndex: number; offsetX: number; offsetY: number }
}
import { useMiddlePanelWidth } from '../../hooks/useLayout'

export class PublicConfigClass implements PublicConfigType {
    public isGroup = false
    public attr = {h:60, minHeight: 24, maxHeight: 500}
}
// 多选成组类
// export class PublicGroupConfigClass extends PublicConfigClass implements CreateTrackGroupType {
//     // 成组
//     public isGroup = true
//     public groupList: Array<CreateTrackType> = []

// }

import type { CreateTrackGroupType } from './TrackStore'
import { loadingStart, loadingFinish, loadingError } from '@/browser/plugins/LoadingContent/loading'

export const createTrackStore = (id: string = 'default') => {
  const storeId = `track-${id}`
  
  return defineStore(storeId, {
    id: storeId,
    state: () => ({
      trackList: [],
      targetTrack: {
        selectId: []
      },
      id: id
    }),
    getters: {
        getTrackList(): Array<CreateTrackType> {
            return this.trackList
        },
        getTargetTrack(): TargetChartType {
            return this.targetTrack
        },
        getTargetTrackInstance() {
            const targetId = this.getTargetTrack.selectId[0]
            if (targetId) {
                return this.getTrackList.find(e => e.key === targetId)
            }
        },

    },
    actions: {
        setSessionWidth() {
            const { eleWidth } = useMiddlePanelWidth()
            this.trackList.map(track  => {
                if (track.attr.w === 0) {
                    track.attr.w = eleWidth.value
                }   
            })
        },
        // * 找到目标 id 数据的下标位置，id可为父级或子集数组（无则返回-1）
        fetchTargetIndex(id?: string): number {
            const targetId = id || (this.getTargetTrack.selectId.length && this.getTargetTrack.selectId[0]) || undefined
            console.log(targetId)
            if (!targetId) {
                // loadingFinish()
                return -1
            }
            const targetIndex = this.trackList.findIndex(e => e.key === targetId)
            console.log(targetIndex)

            // 当前
            if (targetIndex !== -1) {
                return targetIndex
            } else {
                const length = this.getTrackList.length
                for (let i = 0; i < length; i++) {
                    if (this.getTrackList[i].isGroup) {
                        for (const cItem of (this.getTrackList[i] as CreateTrackGroupType).groupList) {
                            if (cItem.id === targetId) {
                                return i
                            }
                        }
                    }
                }
            }
            return -1
        },
         /**
         * * 新增组件列表
         * @param trackInstance 新图表实例
         * @returns
         */
        addTrackList(
            trackInstance:
                | CreateTrackType
                | CreateTrackGroupType
                | Array<CreateTrackType | CreateTrackGroupType>,
            // isHead = false,
            // isHistory = false
        ): void {
            if (trackInstance instanceof Array) {
                trackInstance.forEach(item => {
                    this.addTrackList(item)
                })
                return
            }
            // if (isHistory) {
            //   chartHistoryStore.createAddHistory([componentInstance])
            // }
            // if (isHead) {
            //   this.componentList.unshift(componentInstance)
            //   return
            // }
            this.trackList.push(trackInstance)
        },
        setTargetSelectTrack(selectId?: string | string[], push: boolean = false) {
            // 重复选中
            if (this.targetTrack.selectId.find((e: string) => e === selectId)) return
      
            // 无 id 清空
            if (!selectId) {
              this.targetTrack.selectId = []
              return
            }
            // 多选
            if (push) {
              // 字符串
              if (isString(selectId)) {
                this.targetTrack.selectId.push(selectId)
                return
              }
              // 数组
              if (isArray(selectId)) {
                this.targetTrack.selectId.push(...selectId)
                return
              }
            } else {
              // 字符串
              if (isString(selectId)) {
                this.targetTrack.selectId = [selectId]
                return
              }
              // 数组
              if (isArray(selectId)) {
                this.targetTrack.selectId = selectId
                return
              }
            }
        },
        findTrackById(id: string) {
            return this.trackList.find(e => e.key === id)
        },
        removeTrackList(idArr: string[]): void {
            try {
            //   const idArr = this.idPreFormat(id)
            //   const history: Array<CreateComponentType | CreateComponentGroupType> = []
              // 遍历所有对象
              if (!idArr.length) return
      
              loadingStart()
              idArr.forEach(ids => {
                console.log('removed id',ids)
                const index = this.fetchTargetIndex(ids)
                console.log(index)
                if (index !== -1) {
                //   history.push(this.getComponentList[index])
                  this.trackList.splice(index, 1)
                }
              })
            //   isHistory && chartHistoryStore.createDeleteHistory(history)
              loadingFinish()
              return
            } catch (value) {
              loadingError()
            }
          },
          updateTracksRenderer(trackIds: string[]) {
            this.trackList = this.trackList.map(track => {
                if (trackIds.includes(track.key)) {
                    return {
                        ...track,
                        option: {
                            ...(track.option || {}),
                            renderer: 'svg'
                        }
                    }
                }
                return track
            })
        }
    }
  })
}

export const useTrackStore = (id: string = 'default') => {
  return createTrackStore(id)()
}