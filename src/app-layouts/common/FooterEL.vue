<template>
	<footer class="footer" :class="{ boxed }">
		<div class="wrap flex items-center justify-end gap-3">
			<div class="copy">
				Developed 
				<!-- <Icon :size="22" :color="style['--primary-color']" class="mx-1">
					<BrainIcon />
				</Icon> -->
				By
				<a href="https://github.com/lycai05" target="_blank" alt="Liuyang CAI" rel="noopener noreferrer" class="mx-1">
					Liuyang Cai 
				</a> in<a href="http://www.sustech.edu.cn/en/faculties/yuliangfeng.html" target="_blank" alt="Liuyang CAI" rel="noopener noreferrer" class="mx-1">
					Prof. Yuliang Feng's lab</a>@<a href="http://www.sustech.edu.cn/en/faculties/yuliangfeng.html" target="_blank" alt="Liuyang CAI" rel="noopener noreferrer" class="mx-1">SUSTECH</a>
				<!-- All rights Reserved © Copyright {{ year }} -->
			</div>
		</div>
	</footer>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from "vue"
import Icon from "@/components/common/Icon.vue"
import BrainIcon from "@/assets/icons/brain-icon.svg"
import { useThemeStore } from "@/stores/theme"

defineOptions({
	name: "FooterEL"
})

const props = defineProps<{
	boxed: boolean
}>()
const { boxed } = toRefs(props)

const themeStore = useThemeStore()

const style = computed<{ [key: string]: any }>(() => themeStore.style)

const year = ref(new Date().getFullYear())
</script>

<style lang="scss" scoped>
.footer {
	width: 100%;
	max-width: 100%;
	padding: var(--view-padding);
	padding-top: 0;
	overflow: hidden;
	font-size: 13px;

	.wrap {
		overflow: hidden;
		width: 100%;
		max-width: 100%;

		.copy {
			line-height: 1.6;

			a {
				font-weight: bold;
				text-decoration: none;
			}
			* {
				display: inline;
			}
			i {
				display: inline-block;
			}
		}
	}

	&.boxed {
		padding: 0;
		.wrap {
			padding: var(--view-padding);
			padding-top: 0;
			max-width: var(--boxed-width);
			margin: 0 auto;
		}
	}

	@media (max-width: 700px) {
		font-size: 10px;

		i.n-icon {
			font-size: 18px !important;
		}
	}
}
</style>
