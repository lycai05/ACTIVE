<template>
	<n-card hoverable content-class="!p-0" :title="`Last ${tableRows || 5} orders`" class="overflow-hidden">
		<!-- <template #header-extra>
			<n-dropdown :options="menuOptions" placement="bottom-end" @select="menuSelect">
				<Icon :size="20" :name="MenuIcon" class="ml-3" />
			</n-dropdown>
		</template> -->
		<template #default>
			<div class="content-wrapper">
				<n-scrollbar x-scrollable class="w-full" trigger="none">
					<TableBase :bordered="false" :show-actions="showActions" :show-date="showDate" :rows="tableRows" />
				</n-scrollbar>
			</div>
		</template>
	</n-card>
</template>

<script setup lang="ts">
import { NCard, NDropdown, NScrollbar } from "naive-ui"
import TableBase from "./Base.vue"
import Icon from "@/components/common/Icon.vue"
import { renderIcon } from "@/utils"
import { computed, onMounted, ref, toRefs } from "vue"

const MenuIcon = "carbon:overflow-menu-vertical"
const ExpandIcon = "fluent:expand-up-right-24-regular"
const ContractIcon = "fluent:contract-down-left-24-regular"
const ReloadIcon = "tabler:refresh"

const props = defineProps<{
	showActions?: boolean
	showDate?: boolean
	minWidth?: number
	tableRows?: number
	reload?: (state: boolean) => void
	expand?: (state: boolean) => void
	isExpand?: () => boolean
}>()
const { showActions, showDate, minWidth, reload, expand, isExpand } = toRefs(props)

const tableMinWidth = computed(() => (minWidth?.value ? minWidth.value + "px" : "480px"))
let reloadTimeout: NodeJS.Timeout | null = null
const showExpandButton = ref(true)

/*eslint no-mixed-spaces-and-tabs: "off"*/
const menuOptions = computed(() =>
	showExpandButton.value
		? [
				{
					label: "Expand",
					key: "expand",
					icon: renderIcon(ExpandIcon)
				},
				{
					label: "Reload",
					key: "reload",
					icon: renderIcon(ReloadIcon)
				}
			]
		: [
				{
					label: "Collapse",
					key: "collapse",
					icon: renderIcon(ContractIcon)
				},
				{
					label: "Reload",
					key: "reload",
					icon: renderIcon(ReloadIcon)
				}
			]
)

function menuSelect(key: string) {
	switch (key) {
		case "expand":
			if (expand?.value) {
				expand.value(true)
			}
			break
		case "collapse":
			if (expand?.value) {
				expand.value(true)
			}
			break
		case "reload":
			if (reload?.value) {
				reload.value(true)

				if (reloadTimeout) {
					clearTimeout(reloadTimeout)
				}

				reloadTimeout = setTimeout(() => {
					if (reload.value) {
						reload.value(false)
					}
				}, 1000)
			}
			break
	}
}

onMounted(() => {
	if (isExpand?.value) {
		showExpandButton.value = !isExpand?.value()
	}
})
</script>

<style scoped lang="scss">
.n-card {
	:deep(.n-table) {
		border-radius: 0;
		min-width: v-bind(tableMinWidth);
	}

	.content-wrapper {
		width: 100%;
		display: grid;
		overflow-x: hidden;
	}
}
</style>
