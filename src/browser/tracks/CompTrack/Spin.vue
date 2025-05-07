<template>
    
     <n-spin size="medium" v-show="loading"  content-style="background-color: white; opacity: 0.1">
     <!-- <div
        class="absolute inset-0 z-50 flex items-center justify-center "
      >
        <div class="rounded-lg p-6 text-center">
          <p class="mt-4 text-gray-600 dark:text-gray-300">{{ message }}</p>
        </div>
      </div>-->
      
      <!-- 实际内容 -->
      <!-- <div :class="{ 'pointer-events-none': loading }">
        <slot></slot>
      </div>-->
    </n-spin>
  </template>
  
  <script setup>
  defineProps({
    loading: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    }
  })
  </script>