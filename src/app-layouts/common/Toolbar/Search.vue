<template>
	<div class="flex items-center search-btn m-12" @click="openBox">
		<Icon :name="SearchIcon" :size="32" ></Icon>
		<n-input class="flex-1">Search</n-input>
		<n-text code class="search-command">
			<span :class="{ win: commandIcon === 'CTRL' }">{{ commandIcon }}</span>
			K
		</n-text>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { NText , NInput} from "naive-ui"
import { getOS } from "@/utils"
import Icon from "@/components/common/Icon.vue"
import { useSearchDialog } from "@/composables/useSearchDialog"

const SearchIcon = "ion:search-outline"

defineOptions({
	name: "Search"
})

const commandIcon = ref("⌘")

function openBox() {
	useSearchDialog().open()
}

onMounted(() => {
	const isWindows = getOS() === "Windows"
	commandIcon.value = isWindows ? "CTRL" : "⌘"
})
</script>

<style lang="scss" scoped>
.search-btn {
	border-radius: 50px;
	background-color: var(--bg-body);
	gap: 10px;
	height: 62px;
	cursor: pointer;
	padding: 8px 20px;
	padding-right: 5px;
	outline: none;
	border: none;

	.search-command {
		span {
			line-height: 0;
			position: relative;
			top: 1px;
			font-size: 32px;

			&.win {
				font-size: inherit;
				top: 0;
			}
		}
	}

	:deep() {
		& > .n-icon {
			opacity: 0.5;
			transition: opacity 0.3s;
		}
	}
	& > span {
		opacity: 0.5;
		padding-right: 2px;
		font-size: 14px;
		transition: opacity 0.3s;
	}

	:deep() {
		& > code {
			background-color: var(--hover-005-color);
			border-top-right-radius: 10px;
			border-bottom-right-radius: 10px;
			padding-right: 10px;
		}
	}

	&:hover {
		:deep() {
			& > .n-icon {
				opacity: 0.9;
			}
		}
		& > span {
			opacity: 0.9;
		}
	}

	@media (max-width: 1000px) {
		padding-right: 10px;

		& > span {
			display: none;
		}
		& > .n-text--code {
			display: none;
		}
	}
}
</style>
