
import 'jquery/jquery.min.js'
import 'jquery-ui-dist/jquery-ui.min.js'
import '../../static/js/jquery.flot.js';
import '../../static/js/jquery.flot.downsample.js';
import '../../static/js/jquery.flot.selection.js';
import './plotCurve.js'

import ExpressoVue from './ExpressoVue.vue'
import type { App,Plugin} from "vue"
import {createApp} from 'vue'
import { createPinia } from 'pinia'

// import PrimeVue from 'primevue/config';
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
      NDialog,
      NPopselect
    } from "naive-ui";


const naive = create({
    components: [NCollapse, NCheckbox, NCollapseItem, NCheckboxGroup, NSpace, NDataTable, NMessageProvider, NTag,
      NSelect, NCard, NDescriptionsItem, NScrollbar, NAlert, NSpin, NDropdown, NDescriptions,     NGrid,
      NGridItem,NIcon,NText,NSlider, NInputNumber,NTabs,NTabPane, NStatistic, NGi, NModal, NButton, NButtonGroup,NBreadcrumb,NBreadcrumbItem,NList,NListItem,NSkeleton,NDynamicTags,
    NAutoComplete, NCascader,NTooltip, NDrawer, NDrawerContent, NDivider, NColorPicker,NSwitch, NH2, NH3, NP, NCarousel, NRadioGroup, NRadio, NForm, NFormItem, NInput, NProgress, NPopover, NDialog, NPopselect]
  })

// import "primevue/resources/themes/nano/theme.css";
// import Dialog from 'primevue/dialog';
    // app.use(PrimeVue);
    // app.component('Dialog', Dialog);

type SFCWithInstall<T> = T&Plugin
const withInstall = <T>(comp:T) => {
   (comp as SFCWithInstall<T>).install = (app:App)=>{
    app.use(naive)
    app.use(createPinia())

       //注册组件
       app.component((comp as any).name,comp)
   }
   return comp as SFCWithInstall<T>
}
const Expresso = withInstall(ExpressoVue)

export default Expresso

// export function createVueApp(selector, options) {
//   const app = createApp(ActiveBrowser, options);
//   app.use(naive);
//   app.use(createPinia());
//   app.component(ActiveBrowser.name, ActiveBrowser);
//   app.mount(selector);
// }

// Function to install plugins and components
// function setupPlugins(app) {
//   app.use(naive);
//   app.use(createPinia());
//   // app.use(PrimeVue);
//   // app.component('Dialog', Dialog);
//   // Additional global components can be registered here
// }

// // Export a function to create and mount Vue app
// export function createVueApp(selector, options) {
//   const app = createApp(ActiveBrowser, options);
//   setupPlugins(app);
//   app.mount(selector);
// }


// // If you need to export the Vue component with installation capabilities
// const VueActiveBrowser = {
//   install(app) {
//     setupPlugins(app);
//     app.component(ActiveBrowser.name, ActiveBrowser);
//   }
// };

// export default VueActiveBrowser;