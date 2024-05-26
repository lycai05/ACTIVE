<template>
    <line-g-track-item
    :location="props.location"
    :option="props.config.option"
    @zoomTo="zoomTo"
    :style="props.style"
    >
</line-g-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import LineGTrackItem from './LineGTrackItem.vue'

const props = defineProps({
    config: {
        type: Object,
        required: true
    },
    location: {
        type: Object,
        required: true
    },
    style: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['zoomTo'])
const zoomTo = (chrom, start, end) => {
    console.log(chrom, start, end)
    emit('zoomTo', chrom, start, end)
}
</script>
