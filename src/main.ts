import { createApp } from 'vue'
import { createPinia } from 'pinia'

const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

import jQuery from 'jquery'
// @ts-ignore
window.$ = window.jQuery = jQuery

// import { createI18n } from "vue-i18n"
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// import VueApexCharts from "vue3-apexcharts"
// import VueGoogleMaps from "@fawmi/vue-google-maps"
// @ts-ignore
// import VueVectorMap from "vuevectormap"
// import "vuevectormap/src/scss/vuevectormap.scss"
// import "jsvectormap/dist/maps/world-merc"

import App from '@/App.vue'
import router from '@/router'
// import { type Locales, type MessageSchema, getI18NConf } from "@/lang/config"

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// const i18n = createI18n<MessageSchema, Locales>(getI18NConf())

import {
	create,
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
	NDialog,
	NTable
} from 'naive-ui'

const naive = create({
	components: [
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
		NButton,
		NButtonGroup,
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
		NDialog,
		NTable
	]
})

const app = createApp(App)
app.use(pinia)
// app.use(i18n)
app.use(router)
app.use(naive)

// app.use(VueApexCharts)
// app.use(VueGoogleMaps, {
// 	load: {}
// })
// app.use(VueVectorMap)

app.mount('#app')
