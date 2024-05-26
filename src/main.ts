import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { Buffer } from 'buffer'
globalThis.Buffer = Buffer
globalThis.fetch.bind(globalThis)

import { create,
  NCollapse,
  NCheckbox,
  NCollapseItem,
  NCheckboxGroup,
  NSpace,
  NDataTable,
  NMessageProvider,
  NTag,
  NSelect,
  NCard,
  NDescriptionsItem,
    NScrollbar,
    NAlert,
    NSpin,
    NDropdown,
    NDescriptions,
    NGrid,
    NGridItem,
    NIcon,
    NText,
    NSlider,
    NInputNumber,
    NTabs,
    NTabPane,
    NStatistic,
    NGi,
    NModal,
    NButtonGroup,
    NButton,
    NBreadcrumb,
    NBreadcrumbItem,
    NList,
    NListItem,
    NSkeleton,
    NDynamicTags,
    NAutoComplete,
    NCascader,
    NTooltip,
    NDrawer,
    NDrawerContent,
    NDivider,
    NColorPicker,
    NSwitch,
    NH2,
    NH3,
    NP,
    NCarousel,
    NRadioGroup,
    NRadio,
    NForm,
    NFormItem,
    NInput,
    NProgress,
    NPopover,
    NDialog
  } from "naive-ui";

import './assets/main.css'

const naive = create({
  components: [NCollapse, NCheckbox, NCollapseItem, NCheckboxGroup, NSpace, NDataTable, NMessageProvider, NTag,
    NSelect, NCard, NDescriptionsItem, NScrollbar, NAlert, NSpin, NDropdown, NDescriptions,     NGrid,
    NGridItem,NIcon,NText,NSlider, NInputNumber,NTabs,NTabPane, NStatistic, NGi, NModal, NButton, NButtonGroup,NBreadcrumb,NBreadcrumbItem,NList,NListItem,NSkeleton,NDynamicTags,
  NAutoComplete, NCascader,NTooltip, NDrawer, NDrawerContent, NDivider, NColorPicker,NSwitch, NH2, NH3, NP, NCarousel, NRadioGroup, NRadio, NForm, NFormItem, NInput, NProgress, NPopover, NDialog]
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)

app.mount('#app')
window.$vue = app

const defaultTitle: string = 'ActiveLoops'

router.beforeEach((data) => {
  document.title = ((data.meta.title && `${data.meta.title}-${defaultTitle}`) ||
    defaultTitle) as string
})

