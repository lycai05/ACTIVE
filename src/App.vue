<script setup lang="ts">
import { NConfigProvider, NLoadingBarProvider } from 'naive-ui'
import HomeView from '@/views/HomeView.vue'

// import  TestActiveBrowser from "@/browser/elements/testBrowser/TestActiveBrowser.vue"
// 
// 调整主题变量
const themeOverrides = {
  Tabs: {
    // Tab text color
    tabTextColorLine: '#4F4F4F',
    // Tab text color when hovered
    tabTextColorHoverLine: '#1B4098',
    // Tab text color when activated
    tabTextColorActiveLine: '#66D1F0',
    barColor: '#66D1F0',


  },
  Pagination: {
        // pagination
    itemTextColorHover: 'rgb(59 130 246)',
    itemTextColorPressed: 'rgb(30 64 175)',
    itemTextColorActive: 'color: rgb(37 99 235)',
    itemBorderActive: '1px solid rgb(30 64 175)'
  },
  Breadcrumb: {
    fontSize: '18px'
  },
  Spin: {
    color: '#BBD4DAFF'
  }

}

</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-loading-bar-provider 
      >
      <HomeView />
      <!-- <TestActiveBrowser></TestActiveBrowser> -->
</n-loading-bar-provider>

    </n-message-provider>
  </n-config-provider>
</template>
