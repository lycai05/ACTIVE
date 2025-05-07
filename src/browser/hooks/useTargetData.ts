import { computed, Ref } from 'vue'
import { CreateTrackType, CreateTrackGroupType } from '../components/index.d'
import { useTrackStore } from '../store/TrackStore/TrackStore'

// 获取当前对象数据
export const useTargetData = () => {
  const trackStore = useTrackStore()
  const targetData: Ref<CreateTrackType | CreateTrackGroupType> = computed(() => {
    const list = trackStore.getTrackList
    const targetIndex = trackStore.fetchTargetIndex()
    return list[targetIndex]
  })
  return { targetData, trackStore }
}