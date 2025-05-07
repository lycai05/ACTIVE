// stores/modalStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const showModal = ref(false)
  const modalData = ref(null)
  const requestHistory = ref([])
  
  // 记录请求参数历史
  const addHistory = (params) => {
    requestHistory.value.push({
      ...params,
      timestamp: new Date().toISOString()
    })
  }
  
  // 打开modal并设置数据
  const openModal = (data) => {
    modalData.value = data
    showModal.value = true
  }
  
  // 关闭modal
  const closeModal = () => {
    showModal.value = false
  }

  return {
    showModal,
    modalData,
    requestHistory,
    openModal,
    closeModal,
    addHistory
  }
})