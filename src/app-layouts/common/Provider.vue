<template>
	<n-config-provider :theme="theme" :theme-overrides="themeOverrides" preflight-style-disabled>
		<n-loading-bar-provider :container-style="{ height: '3px' }">
			<n-message-provider>
				<n-notification-provider>
					<n-dialog-provider>
						<n-modal-provider>
						<GlobalListener>
							<slot />
						</GlobalListener>
						<n-modal v-model:show="modalStore.showModal" size = 'huge' :bordered = 'false' preset='card' >     
               <div v-if="modalStore.modalData">
				   <AnnotationDetail :modalData="modalStore.modalData"></AnnotationDetail>
                </div>
            
            </n-modal>
					</n-modal-provider>
					</n-dialog-provider>
				</n-notification-provider>
			</n-message-provider>
		</n-loading-bar-provider>
		<n-global-style />
	</n-config-provider>

</template>

<script lang="ts" setup>
import {
	NGlobalStyle,
	NConfigProvider,
	NDialogProvider,
	NMessageProvider,
	NNotificationProvider,
	NLoadingBarProvider,
	NModalProvider,
	type GlobalThemeOverrides
} from "naive-ui"
import { useThemeStore } from "@/stores/theme"
import { useWindowSize } from "@vueuse/core"
import { computed, onBeforeMount, watch } from "vue"
import GlobalListener from "@/app-layouts/common/GlobalListener.vue"
import { useModalStore } from '@/stores/modalStore'
import AnnotationDetail from "@/views/ResultsDetail/index.vue"
const { width } = useWindowSize()

const themeStore = useThemeStore()

const theme = computed(() => themeStore.naiveTheme)
const themeOverrides = computed<GlobalThemeOverrides>(() => themeStore.themeOverrides)
const style = computed<CSSStyleDeclaration>(() => themeStore.style)

const modalStore = useModalStore()

watch(style, () => {
	setGlobalVars()
})
watch(width, () => {
	themeStore.updateVars()
})

function setGlobalVars() {
	const html = document.children[0] as HTMLElement
	const { style: htmlStyle } = html
	for (const key in style.value) {
		htmlStyle.setProperty(key, style.value[key])
	}
}

onBeforeMount(() => {
	themeStore.updateVars()
	setGlobalVars()
})
</script>
