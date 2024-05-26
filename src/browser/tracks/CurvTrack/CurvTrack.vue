<template>
    <curv-track-item
    :location="props.location"
    :option="props.config.option"
    :style="props.style"
    >
    </curv-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import CurvTrackItem from './CurvTrackItem.vue'

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
        required: true,
    }
})
console.log(props.style)
</script>
