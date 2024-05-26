<template>
  <n-switch v-model:value="controllerConfig.isActive" size="small" class="rotate-90"
    :disabled="!isSelective" />
</template>
  
<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'

const props = defineProps({
  location: {
        type: Object,
        required: true
    },
  controllerConfig: {
    type: Object,
    required: true
  }
})

const controllerConfig = computed(() => { return props.controllerConfig })
const start = computed(
    () => props.location.start
)
const end = computed(
    () => props.location.end
)
// const isSelective = computed({
//     get() {
//         return props.controllerConfig.isSelective
//     },
//     set(newValue) {
//         isSelective.value = newValue
//     }
// })
const visibilityWidth = 1000000
const isSelective = ref(false)

onMounted(() => {
  watch([() => start.value, () => end.value], () => {
        // isVisible.value = true
        // if (isActive.value === false) {
        //     return
        // }
        if (end.value - start.value < visibilityWidth) {
          isSelective.value = true
          controllerConfig.value.isActive = true
        } else {

        }
    }, { immediate: true })
})

</script>
  