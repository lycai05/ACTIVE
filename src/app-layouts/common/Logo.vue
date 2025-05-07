<template>
	<div class="logo  flex justify-left" v-if="isDark && !mini">
		<!-- <img src="@/assets/images/logo_banner.png" /> -->
		<p class="ml-12 text-2xl">CREScope</p>
	</div>
	<div class="logo flex justify-left" v-else-if="isLight && !mini">
		<!-- <img src="@/assets/images/logo_banner.png" /> -->
		 <p class="ml-12 mt-4 text-2xl">CREScope</p>
	</div>
	<div class="logo" v-else-if="isDark && mini">
		<img src="@/assets/images/logo.png" />
	</div>
	<div class="logo" v-else-if="isLight && mini">
		<img src="@/assets/images/logo.png" />
	</div>
</template>

<script lang="ts" setup>
import { useThemeStore } from "@/stores/theme"
import { computed, toRefs } from "vue"

defineOptions({
	name: "Logo"
})

const props = withDefaults(
	defineProps<{
		mini: boolean
		dark?: boolean
	}>(),
	{ dark: undefined }
)
const { mini, dark } = toRefs(props)

const themeStore = useThemeStore()

const isDark = computed<boolean>(() => dark.value ?? themeStore.isThemeDark)
const isLight = computed<boolean>(() => !dark.value || themeStore.isThemeLight)
</script>

<style lang="scss" scoped>
.logo {
	height: 100%;
	display: flex;
	align-items: left;

	// h1 {
	// 	max-height: 60px;
	// 	display: block;
	// 	height: 100%;
	// }

	&.fade-enter-active,
	&.fade-leave-active {
		transition: opacity var(--sidebar-anim-ease) var(--sidebar-anim-duration);
	}

	&.fade-enter-from,
	&.fade-leave-to {
		opacity: 0;
	}
}

.anim-wrap {
	left: 20px
}
</style>
